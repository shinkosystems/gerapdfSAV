// src/App.tsx - CÓDIGO FINAL LIMPO, EXPANSIVO E COM BACKGROUND #ECECEC

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
    // 1. CONTAINER EXTERNO: Alinhamento ao topo, 100% de largura.
    <div className="App" style={{ 
        fontFamily: 'Arial',
        padding: '8px', // MANTIDO: O espaçamento de 8px que você definiu.
        width: '100%', 
        textAlign: 'center', 
    }}>
      
      {/* 2. MOLDURA COM BACKGROUND: Ocupa 100% da largura, possui cor de fundo e mantém espaçamento interno. */}
      <div style={{
          backgroundColor: '#ececec', // ⬅️ NOVO: Cor de fundo solicitada
          padding: '16px', // ⬅️ RESTAURADO: Padding interno para a moldura
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // RESTAURADO: Sombra
          borderRadius: '10px', // RESTAURADO: Cantos arredondados
          width: '100%', // Mantém 100% de largura para expansão
          display: 'block', 
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
              width: '100%', // Faz o botão ocupar 100% da largura da moldura
              minWidth: '320px', 
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