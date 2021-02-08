const db = require('./db');

const testTransaction = async (goodId) => {
    const client = db;
    const transactionOptions = {
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary',
    };

    const session = client.startSession();
    console.log('事务状态：', session.transaction.state);

    try {
        session.startTransaction(transactionOptions);
        console.log('事务状态：', session.transaction.state);

        const goodsColl = await client.db('test').collection('goods');
        const orderGoodsColl = await client.db('test').collection('order_goods');
        const { stock, price } = await goodsColl.findOne({ goodId }, { session });

        console.log('事务状态：', session.transaction.state);

        if (stock <= 0) {
            throw new Error('库存不足');
        }

        await goodsColl.updateOne({ goodId }, {
            $inc: { stock: -1 } // 库存减 1
        })
        await orderGoodsColl.insertOne({ id: Math.floor(Math.random() * 1000), goodId, price }, { session });
        await session.commitTransaction();
    } catch (err) {
        console.log(`[MongoDB transaction] ERROR: ${err}`);
        await session.abortTransaction();
    } finally {
        await session.endSession();
        console.log('事务状态：', session.transaction.state);
    }
}

testTransaction('g1000')