const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ================= CSV Transferência =================
const csvTransferenciaPath = path.resolve(__dirname, '..', 'data', 'tabela_transferencia.csv');

app.get('/api/transferencia', (req, res) => {
    const results = [];

    fs.createReadStream(csvTransferenciaPath)
      .pipe(csv({
          separator: ';', // separador correto do CSV
          mapHeaders: ({ header, index }) => {
              switch(index){
                  case 0: return 'produto';
                  case 1: return 'unidade_negocio';
                  case 2: return 'segmento';
                  case 3: return 'transferencia_chat';
                  case 4: return 'transferencia_telefone';
                  default: return header ? header.trim().toLowerCase().replace(/\s+/g,'_') : null;
              }
          }
      }))
      .on('data', (data) => {
          results.push({
              produto: data.produto?.trim() || '',
              unidade_negocio: data.unidade_negocio?.trim() || '',
              segmento: data.segmento?.trim() || '',
              transferencia_chat: data.transferencia_chat?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || '',
              transferencia_telefone: data.transferencia_telefone?.trim() || ''
          });
      })
      .on('end', () => {
          console.log('CSV de transferência lido com sucesso.');
          res.json(results);
      })
      .on('error', (error) => {
          console.error('Erro ao ler CSV de transferência:', error.message);
          res.status(500).json({ erro: 'Falha ao ler os dados de transferência.' });
      });
});

// ================= CSV Phaseout =================
const csvPhaseoutPath = path.resolve(__dirname, '..', 'data', 'tabela_phaseout.csv');

app.get('/api/phaseout', (req, res) => {
    const results = [];

        fs.createReadStream(csvPhaseoutPath, { encoding: 'utf8' })
.pipe(csv({
    separator: ';',
    mapHeaders: ({ header }) => {
        if (!header) return null;
        const originalHeader = header.trim();
        
        // Mapeamento explícito dos cabeçalhos que você espera
        switch(originalHeader) {
            case 'Unidade': return 'unidade';
            case 'Segmento': return 'segmento';
            case 'Item': return 'item';
            case 'Descrição': return 'descricao'; 
            case 'Modelo': return 'modelo';
            case 'Data Phase out': return 'data_phase_out';
            case 'Substituto direto': return 'substituto_direto';
            // Corrigido: Mapeando a coluna com o erro 'Sust. Dir.'
            case 'Descrição Sust. Dir.': return 'descricao_subs_dir';
            case 'Substituto Indicacao': return 'substituto_indicacao';
            case 'Descrição Subs. Ind.': return 'descricao_subs_ind';
            default:
                // Para qualquer outro cabeçalho, normaliza como fallback
                return originalHeader.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, "");
        }
    }
}))
          .on('data', (data) => {
          results.push({
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
          });
      })
      .on('end', () => {
          console.log('CSV phaseout lido com sucesso.');
          res.json(results);
      })
      .on('error', (error) => {
          console.error('Erro ao ler CSV phaseout:', error.message);
          res.status(500).json({ erro: 'Falha ao ler os dados de phaseout.' });
      });
});

// ================= Servidor =================
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
