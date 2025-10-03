// src/App.tsx

import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from 'react-router-dom';

// 1. Definição da Interface (ajuste conforme as colunas da sua tabela!)
interface Produto {
  id: string; // Coluna usada para filtrar
  nome: string;
  // EXEMPLO: Adicione outras colunas, como:
  // preco: number;
}

// Hook para ler o ID da URL (?id=...)
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const App: React.FC = () => {
  const query = useQuery();
  const idDaUrl = query.get('id');
  
  // 2. CORREÇÃO: Estado agora espera um ARRAY de Produtos (Produto[])
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarProduto = async () => {
    if (!idDaUrl) {
      setError('ID não encontrado na URL. Use o formato: /?id=SEU_ID');
      setProdutos(null);
      return;
    }

    setLoading(true);
    setError(null);
    setProdutos(null);

    try {
      // 3. CORREÇÃO: Removido o .single() para permitir múltiplas linhas
      const { data, error } = await supabase
        .from('inspecoes') // <-- SUBSTITUA PELO NOME REAL DA SUA TABELA
        .select('*')
        .eq('projeto', idDaUrl); 
      
      if (error) throw error;
      
      // 4. CORREÇÃO: Passando o 'data' como um array de produtos (Produto[])
      setProdutos(data as Produto[] | null);
      
    } catch (err: any) {
      console.error('Erro de busca:', err.message);
      setError(`Erro ao buscar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Buscar Dados com ID da URL</h1>
      <p>
        **ID da URL:** <code style={{ backgroundColor: '#eee', padding: '2px 4px' }}>{idDaUrl || 'Aguardando ID...'}</code>
      </p>

      <button 
        onClick={buscarProduto} 
        disabled={loading || !idDaUrl}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {loading ? 'Buscando...' : 'Acessar Supabase'}
      </button>

      <div style={{ marginTop: '30px' }}>
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        
        {/* 5. Renderização dos resultados em lista */}
        {produtos && produtos.length > 0 ? (
          <div>
            <h2>{produtos.length} Resultados Encontrados</h2>
            {produtos.map((p) => (
              // Use a chave primária real do seu produto
              <div key={p.id} style={{ border: '1px solid #ccc', margin: '10px auto', padding: '15px', maxWidth: '400px', textAlign: 'left' }}>
                <p><strong>Nome:</strong> {p.nome}</p>
                <p><strong>ID (do registro):</strong> {p.id}</p>
                {/* Adicione outros campos aqui */}
              </div>
            ))}
          </div>
        ) : (
          !loading && <p>Nenhum dado encontrado ou ID ausente.</p>
        )}
      </div>
    </div>
  );
};

export default App;