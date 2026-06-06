import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { QuestionPaperOutput } from "@/store/assignmentStore";



const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  schoolName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subjectLine: {
    fontSize: 11,
    textAlign: "center",
    color: "#555",
    marginBottom: 10,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaText: { fontSize: 10 },
  metaBold: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  note: {
    fontSize: 9,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 12,
  },
  studentRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  studentField: { fontSize: 10, color: "#555" },
  underline: {
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    width: 100,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 3,
  },
  sectionInstruction: {
    fontSize: 9,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 8,
  },
  questionRow: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 6,
  },
  qNumber: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 22,
  },
  qText: {
    fontSize: 10,
    flex: 1,
    color: "#333",
  },
  qMeta: {
    fontSize: 9,
    color: "#888",
    width: 80,
    textAlign: "right",
  },
  answerKeyTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#1a1a1a",
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 6,
  },
  ansNumber: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    width: 22,
  },
  ansText: {
    fontSize: 10,
    flex: 1,
    color: "#555",
  },
});



function sectionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}



function PaperPDF({ paper }: { paper: QuestionPaperOutput }) {
  let globalQ = 0;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <Text style={s.schoolName}>{paper.schoolName}</Text>
        <Text style={s.subjectLine}>
          Subject: {paper.subject}{"    "}|{"    "}Class: {paper.grade}
        </Text>
        <View style={s.hr} />

        {/* Time / Marks */}
        <View style={s.metaRow}>
          <View style={{ flexDirection: "row" }}>
            <Text style={s.metaText}>Time Allowed: </Text>
            <Text style={s.metaBold}>{paper.timeAllowed}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text style={s.metaText}>Maximum Marks: </Text>
            <Text style={s.metaBold}>{paper.totalMarks}</Text>
          </View>
        </View>

        <Text style={s.note}>
          All questions are compulsory unless stated otherwise.
        </Text>

        {/* Student info */}
        <View style={s.studentRow}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Text style={s.studentField}>Name:</Text>
            <Text style={s.underline}> </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Text style={s.studentField}>Roll No:</Text>
            <Text style={[s.underline, { width: 60 }]}> </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Text style={s.studentField}>Class/Section:</Text>
            <Text style={[s.underline, { width: 60 }]}> </Text>
          </View>
        </View>

        {/* Sections */}
        {paper.sections.map((section, si) => (
          <View key={si} wrap={false}>
            <Text style={s.sectionHeading}>
              Section {sectionLabel(si)} — {section.title}
            </Text>
            {section.instruction ? (
              <Text style={s.sectionInstruction}>{section.instruction}</Text>
            ) : null}

            {section.questions.map((q, qi) => {
              globalQ++;
              return (
                <View key={qi} style={s.questionRow} wrap={false}>
                  <Text style={s.qNumber}>{globalQ}.</Text>
                  <Text style={s.qText}>{q.text}</Text>
                  <Text style={s.qMeta}>
                    ({q.difficulty}) [{q.marks}m]
                  </Text>
                </View>
              );
            })}
          </View>
        ))}

        {/* Answer Key */}
        <Text style={s.answerKeyTitle}>Answer Key</Text>
        {(() => {
          let ansNum = 0;
          return paper.sections.flatMap((section, si) =>
            section.questions.map((q, qi) => {
              ansNum++;
              return (
                <View key={`${si}-${qi}`} style={s.answerRow} wrap={false}>
                  <Text style={s.ansNumber}>{ansNum}.</Text>
                  <Text style={s.ansText}>{q.answer}</Text>
                </View>
              );
            })
          );
        })()}
      </Page>
    </Document>
  );
}



export async function downloadPdf(paper: QuestionPaperOutput): Promise<void> {
  const blob = await pdf(<PaperPDF paper={paper} />).toBlob();
  const url = URL.createObjectURL(blob);

  const slug = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const filename = `${slug(paper.subject)}-${slug(paper.grade)}-paper.pdf`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
