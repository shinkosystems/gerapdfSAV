// src/RelatorioPDF.tsx - CÓDIGO FINAL COM OTIMIZAÇÃO DE ESPAÇO E CONTROLE DE QUEBRA DE PÁGINA

import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Interfaces... (Mantidas)
export interface ItemAuditoria {
// ...
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

export interface RelatorioData {
// ...
title: string;
company: {
cnpjempresa: string;
nomeempresa: string;
};
datafim: string;
endereco: string;
logo_url: string;
clientelogo: string | null;
datainicio: string;
itensobras: ItemAuditoria[];
report_date: string;
nomeinspetor: string;
nrsutilizadas: string[];
datafinalinspecao: string;
itensdocumentacao: ItemAuditoria[];
checklistutilizado: string[];
datainicioinspecao: string;
itensareadevivencia: ItemAuditoria[];
itensmaquinasequipamentos: ItemAuditoria[];
nomeprojeto: string | null;
[key: string]: any;
}


// Estilos... (Mantidos)
const styles = StyleSheet.create({
page: { padding: 30, backgroundColor: '#FFFFFF' },
headerContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: 15,
},
logoHeader: { width: 60, height: 60, objectFit: 'contain' as any },

reportTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', flexGrow: 1, color: '#333' },
sectionContainer: { paddingBottom: 5, borderBottom: '1px solid #ddd' },

sectionHeader: { fontSize: 14, marginTop: 8, marginBottom: 2, fontWeight: 'bold', color: '#333' },

infoText: { fontSize: 10, marginBottom: 3 },
infoTextBold: { fontSize: 10, marginBottom: 3, fontWeight: 'bold' },
infoTextRight: { fontSize: 10, marginBottom: 3, textAlign: 'right' },
infoTextRightBold: { fontSize: 10, marginBottom: 3, textAlign: 'right', fontWeight: 'bold' },

itemBox: {
border: '1px solid black',
marginBottom: 10,
borderRadius: 4
},
itemHeaderBox: {
backgroundColor: '#f0f0f0',
padding: 5,
borderBottom: '1px solid black',
fontSize: 12,
fontWeight: 'bold',
color: '#000',
flexDirection: 'row',
justifyContent: 'space-between',
},
statusContainer: {
flexDirection: 'row',
alignItems: 'center',
},
statusDot: {
width: 8,
height: 8,
borderRadius: 4,
marginRight: 5,
},
itemContent: { padding: 8 },
itemDetails: { fontSize: 10, marginBottom: 3 },
imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
image: { width: '30%', height: 100, marginRight: 5, marginBottom: 5, objectFit: 'cover' as any },
checklistText: { fontSize: 10, marginBottom: 2, marginLeft: 10 },
multaDestacada: {
fontSize: 10,
fontWeight: 'bold',
paddingHorizontal: 2,
backgroundColor: 'rgba(255, 255, 0, 0.7)',
},

coverPage: {
padding: 50,
backgroundColor: '#FFFFFF',
alignItems: 'center',
justifyContent: 'space-between',
},
coverLogo: {
width: 100,
height: 100,
objectFit: 'contain' as any,
},
coverLogoContainer: {
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
width: '100%',
marginBottom: 60,
},
coverTitle: {
fontSize: 30,
fontWeight: 'extrabold',
marginBottom: 5,
color: '#333',
textAlign: 'center'
},
coverSubtitle: {
fontSize: 22,
fontWeight: 'bold',
marginBottom: 40,
color: '#555',
textAlign: 'center'
},
coverDetail: {
fontSize: 10,
marginBottom: 2,
color: '#333',
textAlign: 'right'
},
coverDetailBold: {
fontSize: 10,
marginBottom: 2,
fontWeight: 'bold',
color: '#333',
textAlign: 'right'
},
coverDetailsBlock: {
width: '100%',
alignItems: 'flex-end',
marginBottom: 50,
}
});

// FUNÇÕES E COMPONENTES AUXILIARES (Mantidos)
const getUniqueNrs = (data: RelatorioData): string[] => {
// ...
    const allItems = [
        ...(data.itensobras || []),
        ...(data.itensdocumentacao || []),
        ...(data.itensmaquinasequipamentos || []),
        ...(data.itensareadevivencia || []),
    ];

    const nrs = allItems
        .map(item => item.nr)
        .filter((nr): nr is string => !!nr)
        .map(nr => nr.trim().replace(/\n/g, ''))
        .filter((nr, index, self) => self.indexOf(nr) === index)

    return nrs;
};

const CapaPDF = ({ data, nrsList }: { data: RelatorioData, nrsList: string[] }) => {
// ...
    const clientLogo = (data as any).clientelogo && (data as any).clientelogo.length > 0
        ? (data as any).clientelogo
        : data.logo_url;

    const clientLogoFinal = clientLogo !== data.logo_url
        ? clientLogo + '?v=cliente'
        : clientLogo;


    return (
        <Page size="A4" style={styles.coverPage}>

            <View style={styles.coverLogoContainer}>
                {data.logo_url && <Image style={styles.coverLogo} src={data.logo_url} />}
                <View style={{ width: 80 }} />
                {clientLogoFinal && <Image style={styles.coverLogo} src={clientLogoFinal} />}
            </View>

            <View style={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Text style={styles.coverTitle}>Relatório de Auditoria</Text>
                <Text style={styles.coverSubtitle}>{data.nomeprojeto}</Text>
            </View>

            <View style={styles.coverDetailsBlock}>

                <Text style={styles.coverDetail}>
                    <Text style={styles.coverDetailBold}>Preparado por:</Text> {data.company.nomeempresa}
                </Text>

                <Text style={styles.coverDetail}>
                    <Text style={styles.coverDetailBold}>Executado por:</Text> {data.nomeinspetor}
                </Text>

                <Text style={styles.coverDetail}>
                    <Text style={styles.coverDetailBold}>Inspeção iniciada em:</Text> {data.datainicioinspecao}
                </Text>

                <Text style={styles.coverDetail}>
                    <Text style={styles.coverDetailBold}>Inspeção finalizada em:</Text> {data.datafinalinspecao}
                </Text>

                {nrsList.length > 0 && (
                    <Text style={{ ...styles.coverDetail, marginTop: 10 }}>
                        <Text style={styles.coverDetailBold}>Checklists utilizados:</Text> {nrsList.join(', ')}
                    </Text>
                )}
            </View>
        </Page>
    );
};

const StatusDot = ({ status }: { status: string }) => {
// ...
    let color = '#AAAAAA';
    const normalizedStatus = status.trim().toLowerCase();

    if (normalizedStatus === 'não conforme') {
        color = '#FF0000';
    } else if (normalizedStatus === 'conforme') {
        color = '#008000';
    }

    return (
        <View style={{
            ...styles.statusDot,
            backgroundColor: color
        }} />
    );
};

// REMOVIDO: O ItemRelatorio foi movido para dentro do RelatorioPDF

// Componente Principal do PDF
const RelatorioPDF = ({ data }: { data: RelatorioData }) => {
    const nrsList = getUniqueNrs(data);

    const clientLogo = (data as any).clientelogo && (data as any).clientelogo.length > 0
        ? (data as any).clientelogo
        : data.logo_url;

    const clientLogoFinal = clientLogo !== data.logo_url
        ? clientLogo + '?v=cliente'
        : clientLogo;

    // Variável para rastrear se o primeiro bloco de conteúdo já foi renderizado.
    let isFirstSectionRendered = false;

    // COMPONENTE MOVIDO: ItemRelatorio está agora dentro do escopo de RelatorioPDF
    const ItemRelatorio = ({ item, forceNoBreak = false }: { item: ItemAuditoria, forceNoBreak?: boolean }) => (
        // O 'break' só é aplicado se NÃO for o primeiro item de uma seção forçada a quebrar.
        // Isso garante que o Título e o Primeiro Card fiquem na mesma página.
        <View
            key={item.nr + item.iteminfringido}
            style={styles.itemBox}
            break={!forceNoBreak}
        >

            <View style={styles.itemHeaderBox}>
                <Text>Localização: {item.localizacao || 'Sem Localização'}</Text>

                <View style={styles.statusContainer}>
                    <StatusDot status={item.status} />
                    <Text>Status: {item.status}</Text>
                </View>
            </View>

            <View style={styles.itemContent}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                        {item.nr || 'Item de Risco'}
                    </Text>
                    <Text style={styles.multaDestacada}>
                        Multa: {item.multa || 'N/A'}
                    </Text>
                </View>

                <Text style={styles.itemDetails}><Text style={{ fontWeight: 'bold' }}>Item Infringido:</Text> {item.iteminfringido || 'N/A'}</Text>

                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                    <Text style={styles.itemDetails}><Text style={{ fontWeight: 'bold' }}>Observações (Diagnóstico):</Text> {item.observacao}</Text>
                </View>

                <Text style={styles.itemDetails}><Text style={{ fontWeight: 'bold' }}>Medida Proposta:</Text> {item.medidaproposta}</Text>

                {item.fotosantes && item.fotosantes.length > 0 && (
                    <View style={styles.imageContainer}>
                        <Text style={{ fontSize: 10, width: '100%', marginTop: 6, marginBottom: 4, fontWeight: 'bold' }}>Fotos Antes:</Text>
                        {item.fotosantes.map((url, index) => (
                            <Image key={`antes-${item.nr}-${url.substring(url.length - 10)}-${index}`} style={styles.image} src={url} />
                        ))}
                    </View>
                )}

                {item.fotosdepois && item.fotosdepois.length > 0 && (
                    <View style={styles.imageContainer}>
                        <Text style={{ fontSize: 10, width: '100%', marginTop: 6, marginBottom: 4, fontWeight: 'bold' }}>Fotos Depois (Ação Corretiva):</Text>
                        {item.fotosdepois.map((url, index) => (
                            <Image key={`depois-${item.nr}-${url.substring(url.length - 10)}-${index}`} style={styles.image} src={url} />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );

    // Função centralizada para renderizar as seções de cards
    const renderSection = (items: ItemAuditoria[], title: string) => {
        if (items.length === 0) return null;

        // Se NÃO for a primeira seção a ser renderizada, forçamos a quebra de página
        const shouldBreak = isFirstSectionRendered;

        // O primeiro card sempre deve ficar colado ao título (forceNoBreak={true}), se for o bloco que força a quebra.
        const [firstItem, ...restItems] = items;

        // Marcamos que a primeira seção foi renderizada para que a próxima use o 'break'
        if (!isFirstSectionRendered) {
            isFirstSectionRendered = true;
        }

        return (
            <View style={{ ...styles.sectionContainer, marginBottom: 15 }} break={shouldBreak}>
                <Text style={styles.sectionHeader}>{title} ({items.length})</Text>

                {/* Primeiro item: força NO BREAK para ficar colado no título. */}
                {firstItem && <ItemRelatorio key={firstItem.nr + firstItem.iteminfringido} item={firstItem} forceNoBreak={true} />}

                {/* Itens restantes: usam o break padrão do ItemRelatorio. */}
                {restItems.map(item => <ItemRelatorio key={item.nr + item.iteminfringido} item={item} />)}
            </View>
        );
    };

    return (
        <Document>

            {/* PÁGINA 1: CAPA */}
            <CapaPDF data={data} nrsList={nrsList} />

            {/* PÁGINA 2 em diante: CONTEÚDO DO RELATÓRIO */}
            <Page size="A4" style={styles.page}>

                <View style={styles.headerContainer}>
                    {data.logo_url && <Image style={styles.logoHeader} src={data.logo_url} />}

                    <View style={{ marginHorizontal: 15, alignItems: 'center' }}>
                        <Text style={styles.reportTitle}>Relatório de Auditoria</Text>
                        <Text style={{ fontSize: 10, color: '#555' }}>
                            {data.nomeprojeto}
                        </Text>
                    </View>

                    {clientLogoFinal && <Image style={styles.logoHeader} src={clientLogoFinal} />}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                    <View>
                        <Text style={styles.infoText}><Text style={styles.infoTextBold}>Preparado por:</Text> {data.company.nomeempresa}</Text>
                        <Text style={styles.infoText}><Text style={styles.infoTextBold}>Local da Inspeção:</Text> {data.endereco}</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-end' }}>
                        <Text style={styles.infoTextRight}><Text style={styles.infoTextRightBold}>Inspeção iniciada em:</Text> {data.datainicioinspecao}</Text>
                        <Text style={styles.infoTextRight}><Text style={styles.infoTextRightBold}>Inspeção finalizada em:</Text> {data.datafinalinspecao}</Text>
                        <Text style={styles.infoTextRight}><Text style={styles.infoTextRightBold}>Executado por:</Text> {data.nomeinspetor}</Text>
                    </View>
                </View>

                {/* SITUAÇÃO GERAL - CORRIGIDO: Reduzido marginBottom para 5 */}
                <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 5, fontWeight: 'bold' }}>SITUAÇÃO GERAL</Text>

                {/* 1 ITENS DE DOCUMENTAÇÃO - Se a seção 3 não existiu, esta será a primeira (sem break). */}
                {renderSection(data.itensdocumentacao, 'Itens de Documentação')}

                {/* 2. ITENS DE MÁQUINAS E EQUIPAMENTOS */}
                {renderSection(data.itensmaquinasequipamentos, 'Máquinas e Equipamentos')}

                {/* 3. ITENS DE OBRA/CAMPO - Usa a função renderSection. Se existir, é a primeira (sem break). */}
                {renderSection(data.itensobras, 'Itens de Campo e Obra')}

                {/* 4. ITENS DE ÁREA DE VIVÊNCIA */}
                {renderSection(data.itensareadevivencia, 'Área de Vivência e Conforto')}

                {/* 5. CHECKLIST UTILIZADO - Usa lógica de renderização para aplicar o 'break' corretamente */}
                {data.checklistutilizado.length > 0 && (() => {
                    const shouldBreak = isFirstSectionRendered;
                    if (!isFirstSectionRendered) isFirstSectionRendered = true; // Para garantir que se for a única, o controle fique correto.

                    return (
                        <View style={{ ...styles.sectionContainer, marginBottom: 15 }} break={shouldBreak}>
                            <Text style={styles.sectionHeader}>Checklist de Verificação Utilizado ({data.checklistutilizado.length})</Text>
                            {data.checklistutilizado.map((item, index) => (
                                <Text key={index} style={styles.checklistText}>• {item}</Text>
                            ))}
                        </View>
                    );
                })()}

            </Page>
        </Document>
    );
};

export default RelatorioPDF;