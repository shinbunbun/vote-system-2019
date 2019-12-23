//モジュール読み込み
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
//インスタンス生成
const dynamoDocument = new AWS.DynamoDB.DocumentClient();

//Lambda関数が実行された際、最初に呼び出される関数
exports.handler = async (event) => {
    console.log(event.headers.origin);
    //指定ドメイン以外からのアクセスをブロック
    if (event.headers.origin !== 'http://XXXXX') {
        const res = new Response();
        res.statusCode = 403;
        res.body = JSON.stringify({});
        res.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        };
        return res;
    }
    console.log(event);
    //パスを取得
    const path = event.path;
    //レスポンスを定義
    let res;
    //パスによって条件分岐
    switch (path) {
        case '/transition':
            res = await transitionFunc(event);
            break;
        case '/kougakusai':
            res = await kougakusaiFunc(event);
            break;
        case '/food-gp':
            res = await foodGpFunc(event);
            break;
        case '/vote-complete':
            res = await voteCompletefunc(event);
            break;
    }

    console.log(res);

    //レスポンスを返す
    return res;
};

//フロントエンド側で不正投票の疑いがある挙動を検知した場合又は初回アクセス時に叩かれる
const transitionFunc = async (event) => {

    //レスポンスのインスタンスを生成
    let response = new Response();
    //ヘッダーからIPアドレスを取得
    const ip = event.requestContext.identity.sourceIp;
    //リクエストボディからセッションIDを取得
    let sessionId = JSON.parse(event.body).sessionId;

    //セッションIDが存在する場合
    if (sessionId) {

        //不正投票の可能性があるため、エラーレスポンスを返す
        response.statusCode = 200;
        response.body = JSON.stringify({
            status: 'sessionFoully'
        });
        response.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        };
        return response;
        //セッションIDが存在しない場合
    } else {
        //IPアドレスをキーにDBを検索する
        let param = {
            TableName: 'kougakusai2019',
            IndexName: 'ip-index',
            KeyConditionExpression: '#k = :val',
            ExpressionAttributeValues: {
                ':val': ip
            },
            ExpressionAttributeNames: {
                '#k': 'ip'
            }
        };
        let promise = await new Promise((resolve, reject) => {
            dynamoDocument.query(param, (err, data) => {
                if (err) {
                    reject('$sendToGroup query err : {err}');
                } else {
                    resolve(data);
                }
            });
        });

        //レコードが存在した場合
        //セッションIDを再生成してDBに再登録後、エラーレスポンスを返す
        if (promise.Items[0]) {
            console.log('ipアルヨ');
            //セッションID生成
            sessionId = uuidv4();
            //DBにIPアドレスとセッションIDを登録
            await sessionIdRegister(sessionId, ip);

            //レスポンスをreturn
            response.statusCode = 200;
            response.body = JSON.stringify({
                status: 'ipFoully',
                sessionId: sessionId
            });
            response.headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            };
            return response;

            //レコードが存在しなかった場合
        } else {
            console.log('ipナイヨ');
            //ボディから送信元のパスを取得する
            const path = JSON.parse(event.body).path;
            //パスがルートだった場合
            if (path === '/') {
                //普通に初回アクセスなので、初回アクセス時の処理を行い、レスポンスを返す
                response = await firstAccessFunc(event);
                return response;

                //パスがルートでない場合
                //不正投票の可能性があるため、セッションIDを再登録後エラーレスポンスを返す
            } else {
                sessionId = uuidv4();
                await sessionIdRegister(sessionId, ip);

                response.statusCode = 200;
                response.body = JSON.stringify({
                    status: 'pathFoully'
                });
                response.headers = {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                };
                return response;
            }
        }
    }
};

//一般出展団体投票処理用の関数
const kougakusaiFunc = async (event) => {
    //レスポンスのインスタンスを定義
    const response = new Response();
    //ボディからセッションIDを取得
    const sessionId = JSON.parse(event.body).sessionId;
    //ボディから投票先団体の投票番号を取得
    const id = JSON.parse(event.body).id;
    console.log(sessionId);

    //セッションIDをキーにしてDBを検索する
    let param = {
        TableName: 'kougakusai2019',
        KeyConditionExpression: '#k = :val',
        ExpressionAttributeValues: {
            ':val': sessionId
        },
        ExpressionAttributeNames: {
            '#k': 'sessionId'
        }
    };
    let promise = await new Promise((resolve, reject) => {
        dynamoDocument.query(param, (err, data) => {
            if (err) {
                reject(`err : ${err}`);
            } else {
                resolve(data);
            }
        });
    });
    console.log(`promise: ${promise.Items[0]}`);

    //DBから取得したデータにids（投票先団体の投票番号）が存在する場合（既に何団体かに投票済みの場合）
    if (promise.Items[0].ids) {
        //投票番号の一覧を取り出す
        const ids = promise.Items[0].ids.values;
        //投票番号一覧の最後に今回投票する団体の投票番号を追加する
        ids[ids.length++] = id;

        //すでに3団体投票済みの場合
        //不正投票の可能性があるので、エラーレスポンスを返す
        if (ids.length > 3) {
            response.statusCode = 200;
            response.body = JSON.stringify({
                status: 'idsFoully'
            });
            response.headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            };
            return response;

            //投票済み団体が2団体以下の場合
        } else {

            //DBに投票先団体の投票番号を追加
            param = {
                TableName: 'kougakusai2019',
                Key: {
                    sessionId: sessionId
                },
                ExpressionAttributeNames: {
                    '#i': 'ids'
                },
                ExpressionAttributeValues: {
                    ':ids': dynamoDocument.createSet(ids)
                },
                UpdateExpression: 'SET #i = :ids'
            };
            await new Promise((resolve, reject) => {
                dynamoDocument.update(param, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        }

        //まだ一団体も投票を行なっていない場合
    } else {

        //DBに投票先団体の投票番号を追加
        param = {
            TableName: 'kougakusai2019',
            Key: {
                sessionId: sessionId
            },
            ExpressionAttributeNames: {
                '#i': 'ids'
            },
            ExpressionAttributeValues: {
                ':ids': dynamoDocument.createSet([id])
            },
            UpdateExpression: 'SET #i = :ids'
        };
        await new Promise((resolve, reject) => {
            dynamoDocument.update(param, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    //レスポンスをreturn
    response.statusCode = 200;
    response.body = JSON.stringify({
        status: 'success',
        sessionId: sessionId
    });
    response.headers = {
        'Access-Control-Allow-Origin': '*'
    };
    return response;
};

//飲食出展団体投票処理用の関数
const foodGpFunc = async (event) => {

    //レスポンスのインスタンスを生成
    const response = new Response();
    //ボディからセッションIDを取得
    const sessionId = JSON.parse(event.body).sessionId;
    //ボディから投票先団体の投票番号を取得
    const id = JSON.parse(event.body).id;
    console.log(sessionId);

    //セッションIDをキーにしてDBを検索する
    let param = {
        TableName: 'kougakusai2019',
        KeyConditionExpression: '#k = :val',
        ExpressionAttributeValues: {
            ':val': sessionId
        },
        ExpressionAttributeNames: {
            '#k': 'sessionId'
        }
    };
    let promise = await new Promise((resolve, reject) => {
        dynamoDocument.query(param, (err, data) => {
            if (err) {
                reject(`err : ${err}`);
            } else {
                resolve(data);
            }
        });
    });

    //DBから取得したデータに投票番号が存在する場合（既に投票済みの場合）
    //不正投票の可能性があるので、エラーレスポンスを返す
    if (promise.Items[0].foodId) {
        response.statusCode = 200;
        response.body = JSON.stringify({
            status: 'idsFoully'
        });
        response.headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        };
        return response;

        //まだ投票していない場合
    } else {

        //DBに投票先団体の投票番号を登録
        param = {
            TableName: 'kougakusai2019',
            Key: {
                sessionId: sessionId
            },
            ExpressionAttributeNames: {
                '#i': 'foodId'
            },
            ExpressionAttributeValues: {
                ':foodId': id
            },
            UpdateExpression: 'SET #i = :foodId'
        };
        await new Promise((resolve, reject) => {
            dynamoDocument.update(param, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    //レスポンスをreturn
    response.statusCode = 200;
    response.body = JSON.stringify({
        status: 'success',
        sessionId: sessionId
    });
    response.headers = {
        'Access-Control-Allow-Origin': '*'
    };
    return response;
};

//投票完了処理用の関数
const voteCompletefunc = async (event) => {
    //レスポンスのインスタンスを生成
    const response = new Response();
    //ボディからセッションIDを取得
    const sessionId = JSON.parse(event.body).sessionId;
    console.log(`sessionId: ${sessionId}`);

    //セッションIDをキーにDBを検索
    let param = {
        TableName: 'kougakusai2019',
        KeyConditionExpression: '#k = :val',
        ExpressionAttributeValues: {
            ':val': sessionId
        },
        ExpressionAttributeNames: {
            '#k': 'sessionId'
        }
    };
    let promise = await new Promise((resolve, reject) => {
        dynamoDocument.query(param, (err, data) => {
            if (err) {
                reject(`err : ${err}`);
            } else {
                resolve(data);
            }
        });
    });

    //DBより取得したデータから投票済み団体の投票番号を取得
    const ids = promise.Items[0].ids.values;
    console.log(`ids: ${ids}`);
    //idsの長さ（投票済み団体の数）を取得
    const idsLength = ids.length;
    console.log(`ids: ${ids.length}`);

    //1団体に投票済みの場合
    if (idsLength === 1) {
        //ダミーデータを追加
        ids[2] = 200;
        ids[3] = 0;

        //2団体に投票済みの場合
    } else {
        //ダミーデータを追加
        ids[3] = 0;
    }
    console.log(`ids2: ${ids}`);

    //ダミーデータを追加した投票番号一覧をDBへ再登録
    param = {
        TableName: 'kougakusai2019',
        Key: {
            sessionId: sessionId
        },
        ExpressionAttributeNames: {
            '#i': 'ids'
        },
        ExpressionAttributeValues: {
            ':ids': dynamoDocument.createSet(ids)
        },
        UpdateExpression: 'SET #i = :ids'
    };
    await new Promise((resolve, reject) => {
        dynamoDocument.update(param, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

    //レスポンスをreturn
    response.statusCode = 200;
    response.body = JSON.stringify({
        status: 'success',
        sessionId: sessionId
    });
    response.headers = {
        'Access-Control-Allow-Origin': '*'
    };
    return response;
};

//レスポンスのクラスを作成
class Response {
    constructor() {
        this.statusCode = '';
        this.headers = {};
        this.multiValueHeaders = {};
        this.body = {};
    }
}

//初回アクセス時の処理を行う関数
const firstAccessFunc = async (event) => {
    //console.log(event.headers.cookie);
    //レスポンスのインスタンスを生成
    const response = new Response();
    //ヘッダーからipアドレスを取得
    const ip = event.requestContext.identity.sourceIp;
    //セッションIDを生成
    const sessionId = uuidv4();

    //セッションIDとIPアドレスをDBへ登録
    await sessionIdRegister(sessionId, ip);

    //レスポンスをreturn
    response.statusCode = 200;
    response.body = JSON.stringify({
        status: 'success',
        sessionId: sessionId
    });
    response.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    };
    return response;
};

//日時取得用関数
const getDate = () => {
    const now = new Date();
    // 「年」「月」「日」「曜日」を Date オブジェクトから取り出してそれぞれに代入
    let y = now.getFullYear(),
        m = now.getMonth() + 1,
        d = now.getDate(),
        w = now.getDay(),
        h = now.getHours(),
        min = now.getMinutes(),
        s = now.getSeconds();

    // 曜日の表記を文字列の配列で指定
    const wNames = ['日', '月', '火', '水', '木', '金', '土'];

    // 「月」と「日」で1桁だったときに頭に 0 をつける
    if (m < 10) {
        m = '0' + m;
    }
    if (d < 10) {
        d = '0' + d;
    }

    // フォーマットを整形
    return y + '年' + m + '月' + d + '日 (' + wNames[w] + ') ' + h + '時' + min + '分' + s + '秒';
};

//セッションIDをIPアドレスをDBに登録する関数
const sessionIdRegister = async (sessionId, ip) => {
    const param = {
        TableName: 'kougakusai2019',
        Item: {
            sessionId: sessionId,
            ip: ip,
            date: getDate()
        }
    };
    await new Promise((resolve, reject) => {
        dynamoDocument.put(param, (err, data) => {
            if (err) {
                reject(err);
                console.log(err);
            } else {
                resolve(data);
                console.log(data);
            }
        });
    });
};