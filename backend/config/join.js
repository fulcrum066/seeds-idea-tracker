const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv').config()

const Join = () => {

    MongoClient.connect(process.env.MONGO_URI, function(err, db) {

        //if cant connect to database, throw an error
        if (err) throw err;
    
        //connect to database
        var dbo = db.db(process.env.DB_NAME);

        //drop the collection
        dbo.collection("new").drop(function(err, delOK) {
            if (err) throw err;
            if (delOK) console.log("Collection deleted");
        });
  
        //--------------------join requests onto users------------------------

        dbo.collection('users').aggregate(
            [{
                $lookup: {
                    from: 'requests',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'assistantRequests'
                }
            }, {
                $unwind: {
                    path: '$assistantRequests',
                    includeArrayIndex: ' ',
                    preserveNullAndEmptyArrays: false
                }
            }]
        ).toArray(function(err, res) {
            //throw error if doesnt work
            if (err) throw err;
            
            //put findings into variable
            const answer = res;
    
            //insert into new collection
            dbo.collection("new").insertMany(answer, function(err, res) {
                if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                //close the database
                db.close();
            });
    
        });

        //--------------------join ____ onto _____------------------------


    });
  
}
  
module.exports = Join
