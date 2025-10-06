// src/App.tsx - CÓDIGO FINAL COM AJUSTE DE LARGURA PARA WEBVIEW

import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer'; 
import RelatorioPDF, { type RelatorioData } from './RelatorioPDF'; 


const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const App: React.FC = () => {
  const query = useQuery();
  const idDaUrl = query.get('id');
  
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = async () => {
    if (!idDaUrl) {
      console.error('ID não encontrado na URL.'); 
      return;
    }
    
    const projetoId = Number(idDaUrl);
    if (isNaN(projetoId)) {
      console.error('O ID do projeto deve ser um número válido.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: fetchError } = await supabase.rpc(
        'get_relatorio_auditoria_json', 
        { p_projeto_id: projetoId }       
      );
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Dados do relatório não encontrados.');
      
      const relatorioJsonData = data as RelatorioData;

      const blob = await pdf(
        <RelatorioPDF data={relatorioJsonData} />
      ).toBlob();

      const projectName = relatorioJsonData.nomeprojeto || 'Projeto';
      const fileName = `Relatorio-${projectName}-${idDaUrl}.pdf`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error('Erro no processo de Download:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. CONTAINER EXTERNO: Usa 100% de largura, adequado para WebViews.
    <div className="App" style={{ 
        fontFamily: 'Arial',
        paddingTop: '16px', // ESPAÇO DO TOPO
        width: '100%', // ⬅️ ALTERADO: Usa 100% em vez de 100vw
        textAlign: 'center', 
    }}>
      
      {/* 2. MOLDURA BRANCA: Ocupa 100% da largura do container pai */}
      <div style={{
          backgroundColor: '#FFFFFF', 
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
          borderRadius: '10px',
          width: '100%', // ⬅️ ALTERADO: Ocupa 100% da largura disponível
          display: 'block', // ⬅️ ALTERADO: Deve ser block para ocupar 100%
      }}>
          
          <button 
            onClick={handleDownload}
            disabled={loading || !idDaUrl}
            style={{ 
              padding: '12px 24px', 
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer', 
              backgroundColor: loading ? '#249689bb' : '#249689', 
              color: 'white', 
              border: 'none', 
              borderRadius: '40px', 
              width: '100%', // ⬅️ NOVO: Faz o botão ocupar 100% da moldura
              minWidth: '320px', // Mantém a garantia de largura mínima
              height: '48px',
            }}
          >
            {loading ? 'Gerando Relatório...' : 'Gerar Relatório'}
          </button>

      </div>
      
    </div>
  );
};

export default App;