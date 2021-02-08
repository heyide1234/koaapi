const db = require("./mongodb");

const testTransaction = async (datas) => {
    const client = db;
    const transactionOptions = {
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
    };
    const session = client.startSession();
    console.log('事务状态1：', session.transaction.state);

    try {
        session.startTransaction(transactionOptions);
        console.log('事务状态2：', session.transaction.state);
        //逻辑代码
        //...
        //...
        //...
        // const goodsColl = await client.db('test').collection('goods');
        // const orderGoodsColl = await client.db('test').collection('order_goods');
        DB.find(datas.table, datas.where, {});

        console.log('事务状态3：', session.transaction.state);
        if (stock <= 0) {
            throw new Error('库存不足');
        }
        await session.commitTransaction();
    } catch (err) {
        console.log(`[MongoDB transaction] ERROR: ${err}`);
        await session.abortTransaction();
    } finally {
        await session.endSession();
        console.log('事务状态4：', session.transaction.state);
    }
}

export default testTransaction
