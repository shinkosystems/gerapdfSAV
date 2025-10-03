// src/App.tsx

import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from 'react-router-dom';

// Não precisamos mais da interface 'Produto' por enquanto, 
// pois a RPC retorna um JSON complexo que trataremos como Record<string, any>
// Você pode substituir Record<string, any> por uma interface real depois.

// Hook para ler o ID da URL (?id=...)
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const App: React.FC = () => {
  const query = useQuery();
  const idDaUrl = query.get('id');
  
  // O estado armazena o JSON complexo retornado pela RPC
  const [relatorioJson, setRelatorioJson] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarRelatorio = async () => {
    if (!idDaUrl) {
      setError('ID não encontrado na URL. Use o formato: /?id=SEU_ID');
      setRelatorioJson(null);
      return;
    }
    
    // O parâmetro da RPC espera um tipo BIGINT, então garantimos que é um número.
    const projetoId = Number(idDaUrl);
    if (isNaN(projetoId)) {
      setError('O ID do projeto deve ser um número válido (BIGINT).');
      return;
    }

    setLoading(true);
    setError(null);
    setRelatorioJson(null);

    try {
      // 1. CHAMADA RPC CORRIGIDA
      const { data, error } = await supabase.rpc(
        'get_relatorio_auditoria_json', // NOME DA RPC
        { p_projeto_id: projetoId }       // NOME E VALOR DO PARÂMETRO
      );
      
      if (error) throw error;
      
      // A RPC retorna o JSON na propriedade 'data'
      setRelatorioJson(data as Record<string, any> | null);
      
    } catch (err: any) {
      console.error('Erro de busca:', err.message);
      // O Supabase pode retornar erros de RLS ou de execução da função
      setError(`Erro ao buscar: ${err.message}. Verifique o RLS ou o nome da RPC.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Buscar Dados com RPC</h1>
      <p>
        **ID do Projeto (da URL):** <code style={{ backgroundColor: '#eee', padding: '2px 4px' }}>{idDaUrl || 'Aguardando ID...'}</code>
      </p>

      <button 
        onClick={buscarRelatorio} // Chama a nova função
        disabled={loading || !idDaUrl}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {loading ? 'Buscando JSON...' : 'Buscar Relatório via RPC'}
      </button>

      <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '800px', margin: '30px auto' }}>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        
        {/* EXIBIÇÃO DO JSON NA TELA */}
        {relatorioJson ? (
          <div>
            <h2>JSON do Relatório Encontrado:</h2>
            <pre style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {/* Formata e exibe o JSON de forma legível */}
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