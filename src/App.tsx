// src/App.tsx - CÓDIGO CORRIGIDO PARA O ERRO DE BUILD (TS6133)

import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useLocation } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer'; 
// Importação correta do componente e do tipo (interface)
import RelatorioPDF, { type RelatorioData } from './RelatorioPDF'; 


// Hook para ler o ID da URL (?id=...)
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const App: React.FC = () => {
  const query = useQuery();
  const idDaUrl = query.get('id');
  
  const [loading, setLoading] = useState<boolean>(false);
  // [CORRIGIDO] Linha removida: const [error, setError] = useState<string | null>(null);

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
    // [CORRIGIDO] Linha removida: setError(null);

    try {
      // 1. BUSCAR JSON
      const { data, error: fetchError } = await supabase.rpc(
        'get_relatorio_auditoria_json', 
        { p_projeto_id: projetoId }       
      );
      
      if (fetchError) throw fetchError;
      if (!data) throw new Error('Dados do relatório não encontrados.');
      
      const relatorioJsonData = data as RelatorioData;

      // 2. GERAR O PDF COMO BLOB (Geração assíncrona do documento)
      const blob = await pdf(
        <RelatorioPDF data={relatorioJsonData} />
      ).toBlob();

      // 3. INICIAR O DOWNLOAD MANUALMENTE
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
    // 1. CONTAINER EXTERNO: Layout do topo. Usa padding-top para empurrar a moldura para baixo.
    <div style={{ 
        fontFamily: 'Arial',
        paddingTop: '16px', // Espaço do topo da tela
        width: '100%',
        display: 'flex',
        justifyContent: 'center', // Centraliza a moldura horizontalmente
        // Importante: Não definimos background aqui para que o fundo seja o padrão do body.
    }}>
      
      {/* 2. MOLDURA BRANCA (Contém o botão com 16px de padding ao redor) */}
      <div style={{
          backgroundColor: '#FFFFFF', 
          padding: '16px', // A moldura de 16px
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
          borderRadius: '10px',
      }}>
          
          {/* BOTÃO ÚNICO */}
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