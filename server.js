const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let resultados = [];

function cargarResultados() {
    resultados = [];
    fs.createReadStream('euromillones_full.csv')
        .pipe(csv())
        .on('data', (row) => {
            resultados.push({
                date: row.date,
                numbers: [
                    +row.number1,
                    +row.number2,
                    +row.number3,
                    +row.number4,
                    +row.number5,
                ].sort((a,b) => a-b),
                stars: [
                    +row.star1,
                    +row.star2,
                ].sort((a,b) => a-b)
            });
        })
        .on('end', () => {
            console.log(`Cargados ${resultados.length} resultados`);
        });
}

app.post('/check', (req, res) => {
    const { numbers, stars } = req.body;
    if (!numbers || !stars) {
        return res.status(400).json({ error: 'Faltan números o estrellas' });
    }
    const numbersSorted = [...numbers].sort((a,b) => a-b);
    const starsSorted = [...stars].sort((a,b) => a-b);

    const foundDates = resultados
        .filter(r => 
            JSON.stringify(r.numbers) === JSON.stringify(numbersSorted) && 
            JSON.stringify(r.stars) === JSON.stringify(starsSorted)
        )
        .map(r => r.date);

    res.json({ found: foundDates.length > 0, dates: foundDates });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
    cargarResultados();
});
