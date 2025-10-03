// src/RelatorioPDF.tsx

import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { RelatorioData } from './App';

// Estilos
const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#FFFFFF' },
  header: { fontSize: 24, marginBottom: 15, textAlign: 'center', color: '#1a1a1a' },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 15, objectFit: 'contain' as any },
  
  // Seções e Subtítulos
  sectionContainer: { marginBottom: 18, paddingBottom: 5, borderBottom: '1px solid #ddd' },
  sectionHeader: { fontSize: 14, marginTop: 10, marginBottom: 8, fontWeight: 'bold', color: '#333' },
  infoText: { fontSize: 10, marginBottom: 4 },
  
  // Itens de Auditoria (NRs)
  itemContainer: { marginBottom: 15, padding: 10, border: '1px solid #ccc', borderRadius: 4 },
  itemTitle: { fontSize: 11, marginBottom: 5, fontWeight: 'bold' },
  itemDetails: { fontSize: 9, marginBottom: 4 },
  
  // Imagens
  imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  image: { width: '30%', height: 100, marginRight: 5, marginBottom: 5, objectFit: 'cover' as any }, 
  
  // Checklist
  checklistText: { fontSize: 9, marginBottom: 3, marginLeft: 10 },
});


// Componente para renderizar os detalhes de um Item de Auditoria (reutilizado 4 vezes)
const ItemRelatorio = (item: RelatorioData['itensobras'][0]) => (
  // O 'break' permite que o item não seja cortado entre páginas
  <View key={item.nr + item.iteminfringido} style={styles.itemContainer} break> 
    <Text style={styles.itemTitle}>
      {item.nr} | Status: {item.status} | Multa: {item.multa}
    </Text>
    
    <Text style={styles.itemDetails}>**Item Infringido:** {item.iteminfringido}</Text>
    <Text style={styles.itemDetails}>**Localização:** {item.localizacao || 'Não Informado'}</Text>
    <Text style={styles.itemDetails}>**Observação:** {item.observacao}</Text>
    <Text style={styles.itemDetails}>**Medida Proposta:** {item.medidaproposta}</Text>
    
    {/* RENDERIZAÇÃO DAS IMAGENS */}
    {item.fotosantes && item.fotosantes.length > 0 && (
      <View style={styles.imageContainer}>
        <Text style={{ fontSize: 9, width: '100%', marginTop: 5, marginBottom: 5, fontWeight: 'bold' }}>Fotos Antes:</Text>
        {item.fotosantes.map((url, index) => (
          // Usamos a URL do JSON para o componente Image
          <Image key={index} style={styles.image} src={url} /> 
        ))}
      </View>
    )}
  </View>
);


// Componente Principal do PDF
const RelatorioPDF = ({ data }: { data: RelatorioData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* 1. CABEÇALHO e LOGO */}
      <View style={{ marginBottom: 20 }}>
        {data.logo_url && <Image style={styles.logo} src={data.logo_url} />}
        <Text style={styles.header}>{data.title || 'Relatório de Auditoria'}</Text>
      </View>
      
      {/* 2. INFORMAÇÕES GERAIS */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Informações do Contrato</Text>
        <Text style={styles.infoText}>**Empresa:** {data.company.nomeempresa} (CNPJ: {data.company.cnpjempresa})</Text>
        <Text style={styles.infoText}>**Endereço:** {data.endereco}</Text>
        <Text style={styles.infoText}>**Inspetor:** {data.nomeinspetor}</Text>
        <Text style={styles.infoText}>**Período de Auditoria:** {data.datainicioinspecao} a {data.datafinalinspecao} (Geração: {data.report_date})</Text>
      </View>

      {/* 3. ITENS DE OBRA/CAMPO */}
      {data.itensobras.length > 0 && (
        <View style={styles.sectionContainer} break>
          <Text style={styles.sectionHeader}>Itens de Campo e Obra ({data.itensobras.length})</Text>
          {data.itensobras.map(ItemRelatorio)}
        </View>
      )}

      {/* 4. ITENS DE DOCUMENTAÇÃO */}
      {data.itensdocumentacao.length > 0 && (
        <View style={styles.sectionContainer} break>
          <Text style={styles.sectionHeader}>Itens de Documentação ({data.itensdocumentacao.length})</Text>
          {data.itensdocumentacao.map(ItemRelatorio)}
        </View>
      )}

      {/* 5. ITENS DE MÁQUINAS E EQUIPAMENTOS */}
      {data.itensmaquinasequipamentos.length > 0 && (
        <View style={styles.sectionContainer} break>
          <Text style={styles.sectionHeader}>Máquinas e Equipamentos ({data.itensmaquinasequipamentos.length})</Text>
          {data.itensmaquinasequipamentos.map(ItemRelatorio)}
        </View>
      )}

      {/* 6. ITENS DE ÁREA DE VIVÊNCIA */}
      {data.itensareadevivencia.length > 0 && (
        <View style={styles.sectionContainer} break>
          <Text style={styles.sectionHeader}>Área de Vivência e Conforto ({data.itensareadevivencia.length})</Text>
          {data.itensareadevivencia.map(ItemRelatorio)}
        </View>
      )}

      {/* 7. CHECKLIST UTILIZADO */}
      {data.checklistutilizado.length > 0 && (
        <View style={styles.sectionContainer} break>
          <Text style={styles.sectionHeader}>Checklist de Verificação Utilizado ({data.checklistutilizado.length})</Text>
          {data.checklistutilizado.map((item, index) => (
            <Text key={index} style={styles.checklistText}>• {item}</Text>
          ))}
        </View>
      )}

      {/* 8. NR's UTILIZADAS (Simplesmente lista) */}
      {data.nrsutilizadas.length > 0 && (
        <View style={styles.sectionContainer} break>
          <Text style={styles.sectionHeader}>Referências de NR's e Tópicos de Risco</Text>
          {data.nrsutilizadas.map((nr, index) => (
            <Text key={index} style={styles.checklistText}>• {nr}</Text>
          ))}
        </View>
      )}

    </Page>
  </Document>
);

export default RelatorioPDF;