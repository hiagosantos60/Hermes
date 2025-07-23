const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// CSV transferência
const csvPath = path.resolve(__dirname, '..', 'data', 'tabela_transferencia.csv');

app.get('/api/transferencia', (req, res) => {
    const results = [];
    // If 'tabela_transferencia.csv' also has encoding issues, you might need to add { encoding: 'latin1' } here too.
    // For now, assuming it's fine or UTF-8.
    fs.createReadStream(csvPath)
        .pipe(csv({
            separator: ';',
            mapHeaders: ({ header }) => {
                // Map headers to a consistent, lowercase format
                // This will convert "Segmento" to "segmento", "codigo" to "codigo", etc.
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

// CSV phaseout
const csvPhaseoutPath = path.resolve(__dirname, '..', 'data', 'tabela_phaseout.csv');

app.get('/api/phaseout', (req, res) => {
    const results = [];
    // Attempting 'utf8' first as 'latin1' was causing 'TELEFNICA'.
    // If 'utf8' doesn't work for 'Nao se aplica' or 'ç', try 'latin1' again.
    fs.createReadStream(csvPhaseoutPath, { encoding: 'utf8' }) // Changed to 'utf8'
        .pipe(csv({
            separator: ';',
            mapHeaders: ({ header }) => {
                // Normalize all headers: trim, lowercase, replace spaces with underscores, remove accents.
                // This makes the mapping more robust against subtle differences.
                const normalizedHeader = header.trim().toLowerCase()
                                            .replace(/\s+/g, '_') // Replaces spaces with underscores
                                            .normalize("NFD") // Decomposes accented characters
                                            .replace(/[\u0300-\u036f]/g, ""); // Removes the accents

                // Explicitly map normalized headers to your desired keys
                switch (normalizedHeader) {
                    case 'data_phase_out':
                        return 'data_phase_out';
                    case 'substituto_direto':
                        return 'substituto_direto';
                    case 'descricao_sust._dir.': // Based on "Descrição Sust. Dir." -> normalized
                        return 'descricao_subs_dir'; // Renamed to match your desired output key
                    case 'substituto_indicacao': // Based on "Substituto Indicacao" -> normalized
                        return 'substituto_indicacao';
                    case 'descricao_subs._ind.': // Based on "Descrição Subs. Ind." -> normalized
                        return 'descricao_subs_ind';
                    case 'unidade':
                        return 'unidade';
                    case 'segmento':
                        return 'segmento';
                    case 'item':
                        return 'item';
                    case 'descricao': // Maps "Descrição" -> "descricao"
                        return 'descricao';
                    case 'modelo':
                        return 'modelo';
                    default:
                        // If a header doesn't match a specific case, use its normalized form as the key.
                        return normalizedHeader;
                }
            }
        }))
        .on('data', (data) => {
            // Log the raw data object from csv-parser for debugging
            // console.log('Raw CSV data row:', data);

            const formattedData = {
                unidade: data.unidade || '',
                segmento: data.segmento || '',
                item: data.item || '',
                // Ensure 'descricao' is mapped correctly from the normalized header
                descricao: data.descricao || '',
                modelo: data.modelo || '',
                data_phase_out: data.data_phase_out || '',
                substituto_direto: data.substituto_direto || '',
                // Ensure these are mapped from their *normalized* header names
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
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
