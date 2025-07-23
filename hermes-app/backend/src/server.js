const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//CSV transferência
const csvPath = path.resolve(__dirname, '..', 'data', 'tabela_transferencia.csv');

app.get('/api/transferencia', (req, res) => {
    const results = [];
    fs.createReadStream(csvPath)
        .pipe(csv({
            separator: ';',
            mapHeaders: ({ header }) => {
                return header.trim().toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            }
        }))
        .on('data', (data) => {
            const formattedData = {
                segmento: data.segmento || '',
                codigo: data.codigo || '',
                produto: data.produto || '',
                transferencia_telefone: data.transferencia_telefone || '',
                transferencia_blip: data.transferencia_blip || '',
            };
            results.push(formattedData);
        })
        .on('end', () => {
            console.log('Dados do CSV de transferência lidos e enviados com sucesso.');
            res.json(results);
        })
        .on('error', (error) => {
            console.error('Erro ao ler o arquivo CSV de transferência:', error.message);
            res.status(500).json({ erro: 'Falha ao ler os dados de transferência.' });
        });
});

//CSV phaseout
const csvPhaseoutPath = path.resolve(__dirname, '..', 'data', 'tabela_phaseout.csv');

app.get('/api/phaseout', (req, res) => {
    const results = [];
    fs.createReadStream(csvPhaseoutPath, { encoding: 'utf8' }) 
        .pipe(csv({
            separator: ';',
            mapHeaders: ({ header }) => {
                const normalizedHeader = header.trim().toLowerCase()
                                            .replace(/\s+/g, '_') 
                                            .normalize("NFD") 
                                            .replace(/[\u0300-\u036f]/g, "");

                switch (normalizedHeader) {
                    case 'data_phase_out':
                        return 'data_phase_out';
                    case 'substituto_direto':
                        return 'substituto_direto';
                    case 'descricao_sust._dir.': 
                        return 'descricao_subs_dir'; 
                    case 'substituto_indicacao': 
                        return 'substituto_indicacao';
                    case 'descricao_subs._ind.': 
                        return 'descricao_subs_ind';
                    case 'unidade':
                        return 'unidade';
                    case 'segmento':
                        return 'segmento';
                    case 'item':
                        return 'item';
                    case 'descricao': 
                        return 'descricao';
                    case 'modelo':
                        return 'modelo';
                    default:
                        return normalizedHeader;
                }
            }
        }))
        .on('data', (data) => {

            const formattedData = {
                unidade: data.unidade || '',
                segmento: data.segmento || '',
                item: data.item || '',
                descricao: data.descricao || '',
                modelo: data.modelo || '',
                data_phase_out: data.data_phase_out || '',
                substituto_direto: data.substituto_direto || '',
                descricao_subs_dir: data.descricao_subs_dir || '',
                substituto_indicacao: data.substituto_indicacao || '',
                descricao_subs_ind: data.descricao_subs_ind || ''
            };
            results.push(formattedData);
        })
        .on('end', () => {
            console.log('✅ Phaseout CSV lido e normalizado.');
            res.json(results);
        })
        .on('error', (error) => {
            console.error('Erro ao ler o arquivo CSV phaseout:', error.message);
            res.status(500).json({ erro: 'Falha ao ler os dados de phaseout.' });
        });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
