// src/App.tsx - CÓDIGO FINAL LIMPO, EXPANSIVO E COM ÍCONE CLIPBOARD PLUS

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
        padding: '0px',
        width: '100%', 
        textAlign: 'center', 
    }}>
      
      {/* 2. MOLDURA COM BACKGROUND */}
      <div style={{
          backgroundColor: 'rgba(232, 232, 232, 1)', 
          padding: '8px 0px', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
          borderRadius: '10px', 
          width: '100%', 
          display: 'block', 
      }}>
          
          <button 
            onClick={handleDownload}
            disabled={loading || !idDaUrl}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '12px 24px', 
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer', 
              backgroundColor: loading ? '#249689bb' : '#249689', 
              color: 'white', 
              border: 'none', 
              borderRadius: '40px', 
              width: '100%', 
              minWidth: '320px', 
              height: '48px', 
            }}
          >
            {/* ÍCONE SVG CLIPBOARD PLUS - Tamanho ajustado para 18x18 e strokeWidth para 2.5 */}
            {!loading && (
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ marginRight: '8px' }} // Espaçamento entre o ícone e o texto
                >
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <path d="M9 14h6"/>
                    <path d="M12 17v-6"/>
                </svg>
            )}

            {/* Texto do Botão */}
            {loading ? 'Gerando Relatório...' : 'Gerar Relatório'}
          </button>

      </div>
      
    </div>
  );
};

export default App;