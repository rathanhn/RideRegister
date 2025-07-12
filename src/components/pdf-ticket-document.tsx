
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    border: '1px solid #e0e0e0',
    borderRadius: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  }
});

interface PdfTicketProps {
  data: {
    registrationId: string;
    riderNumber: 1 | 2;
    riderName: string;
  }
}

export const PdfTicketDocument = ({ data }: PdfTicketProps) => {
  return (
    <Document title={`Ride-Ticket-${data.riderName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>RideRegister Event Ticket</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.text}><Text style={styles.bold}>Rider Name:</Text> {data.riderName}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Rider Number:</Text> {data.riderNumber}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Registration ID:</Text> {data.registrationId}</Text>
          <Text style={[styles.text, {marginTop: 20}]}>Thank you for registering. Please present this ticket at check-in.</Text>
        </View>
      </Page>
    </Document>
  );
};
