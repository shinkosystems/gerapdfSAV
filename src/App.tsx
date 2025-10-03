// src/App.tsx

import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer'; 
import RelatorioPDF from './RelatorioPDF'; 

// Interface para um item de auditoria (usada em todos os arrays de detalhes)
interface ItemAuditoria {
  nr: string;
  multa: string;
  status: string;
  observacao: string;
  localizacao: string | null; 
  iteminfringido: string;
  medidaproposta: string;
  fotosantes: string[] | null; 
  fotosdepois: string[] | null;
}

// Interface principal do relatório (Exportada)
export interface RelatorioData {
  title: string;
  company: {
    cnpjempresa: string;
    nomeempresa: string;
  };
  datafim: string;
  endereco: string;
  logo_url: string; 
  datainicio: string;
  itensobras: ItemAuditoria[]; 
  report_date: string;
  nomeinspetor: string;
  nrsutilizadas: string[]; 
  datafinalinspecao: string;
  itensdocumentacao: ItemAuditoria[]; 
  checklistutilizado: string[]; // Array de strings (perguntas/respostas)
  datainicioinspecao: string;
  itensareadevivencia: ItemAuditoria[]; // Novo array
  itensmaquinasequipamentos: ItemAuditoria[]; // Novo array
  [key: string]: any; 
}

// Hook para ler o ID da URL (?id=...)
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const App: React.FC = () => {
  const query = useQuery();
  const idDaUrl = query.get('id');
  
  const [relatorioJson, setRelatorioJson] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarRelatorio = async () => {
    if (!idDaUrl) {
      setError('ID não encontrado na URL. Use o formato: /?id=SEU_ID');
      setRelatorioJson(null);
      return;
    }
    
    const projetoId = Number(idDaUrl);
    if (isNaN(projetoId)) {
      setError('O ID do projeto deve ser um número válido (BIGINT).');
      return;
    }

    setLoading(true);
    setError(null);
    setRelatorioJson(null);

    try {
      const { data, error } = await supabase.rpc(
        'get_relatorio_auditoria_json', 
        { p_projeto_id: projetoId }       
      );
      
      if (error) throw error;
      
      setRelatorioJson(data as RelatorioData | null);
      
    } catch (err: any) {
      console.error('Erro de busca:', err.message);
      setError(`Erro ao buscar: ${err.message}. Verifique o RLS ou o nome da RPC.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Gerador de PDF por Projeto</h1>
      <p>
        **ID do Projeto (da URL):** <code style={{ backgroundColor: '#eee', padding: '2px 4px' }}>{idDaUrl || 'Aguardando ID...'}</code>
      </p>

      <button 
        onClick={buscarRelatorio}
        disabled={loading || !idDaUrl}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {loading ? 'Buscando JSON...' : 'Buscar Relatório via RPC'}
      </button>

      <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '800px', margin: '30px auto' }}>
        {error && <p style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
        
        {relatorioJson ? (
          <div style={{ textAlign: 'center' }}>
            <h2>Relatório Encontrado!</h2>
            
            <PDFDownloadLink
              document={<RelatorioPDF data={relatorioJson} />}
              fileName={`Relatorio-Projeto-${idDaUrl}.pdf`}
            >
              {({ loading }) =>
                loading ? 'Carregando documento...' : 
                <button style={{ 
                    padding: '12px 25px', 
                    fontSize: '18px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    marginTop: '15px' 
                  }}>
                  Baixar Relatório PDF
                </button>
              }
            </PDFDownloadLink>

            {/* Opcional: DEBUG */}
            <h3 style={{ marginTop: '30px', marginBottom: '10px' }}>JSON (Para Debug):</h3>
             <pre style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '10px' }}>
              {JSON.stringify(relatorioJson, null, 2)}
            </pre>
          </div>
        ) : (
          !loading && <p style={{ textAlign: 'center' }}>Nenhum JSON de relatório encontrado ou ID ausente.</p>
        )}
      </div>
    </div>
  );
};

export default App;