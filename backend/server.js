import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
  
const uri = 'mongodb+srv://root:root@cluster0.n03hxot.mongodb.net/';
const client = new MongoClient(uri);

const dbName = 'dashboard';

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


  app.get('/data', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('dashboard');

    const data = await collection.find().toArray();
    console.log(data)
    let { frequency, startDate, endDate } = req.query;
    startDate = startDate ? new Date(startDate) : null;
    endDate = endDate ? new Date(endDate) : null;

    let filtered = data.filter(item => {
        if (!startDate || !endDate) return true;
        const itemDate = new Date(item.Date);

        if (itemDate < startDate || itemDate > endDate) {
            return false;
        }

        switch (frequency) {
            case 'Daily':
                return itemDate >= startDate && itemDate <= endDate;
            case 'Weekly':
                const weekStart = new Date(startDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekEnd = new Date(endDate);
                weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));
                return itemDate >= weekStart && itemDate <= weekEnd;
            case 'Monthly':
                return itemDate >= startDate && itemDate <= endDate;
            case 'Yearly':
                return itemDate.getFullYear() >= startDate.getFullYear() &&
                    itemDate.getFullYear() <= endDate.getFullYear();
            default:
                return true;
        }
    });

    const groupedData = groupData(filtered, frequency);
    const totals = calculateTotals(groupedData);
  
    res.json({groupedData,totals});
});

function calculateTotals(groupedData){
    const totals = {
        daily : 0,
        weekly: 0,
        monthly: 0,
        yearly: 0
    };

    for(const key in groupedData){
        if(groupedData.hasOwnProperty(key)){
            const group = groupedData[key];
            group.forEach(item=>{
                totals.daily+= item.MilesDriven;
            });
            totals.weekly += group.reduce((acc,item)=> acc+item.MilesDriven,0);
        }
    }

    for(const key in groupedData){
        if(groupedData.hasOwnProperty(key)){
            const group = groupedData[key];
            totals.monthly += group.reduce((acc,item)=> acc+item.MilesDriven,0);
        }
    }

    for(const key in groupedData){
        if(groupedData.hasOwnProperty(key)){
            const group = groupedData[key];
            totals.yearly += group.reduce((acc,item)=> acc+item.MilesDriven,0);
        }
    }
    return totals
}

function groupData(data, frequency) {
    const sortedData = data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    const grouped = {};
    sortedData.forEach(item => {
        const itemDate = new Date(item.Date);

        let key;
        switch (frequency) {
            case 'Weekly':
                const weekStart = new Date(itemDate);
                weekStart.setDate(itemDate.getDate() - itemDate.getDay());
                key = weekStart.toISOString().substring(0, 10);
                break;
            case 'Monthly':
                key = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}`;
                break;
            case 'Yearly':
                key = `${itemDate.getFullYear()}`;
                break;
            default:
                key = 'All'; 
                break;
        }

        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(item);
    });
    return grouped;
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
