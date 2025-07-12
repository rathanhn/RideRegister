
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image, Svg, Circle, Defs, ClipPath } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.ttf', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.ttf', fontWeight: 700 },
  ],
});
Font.register({
    family: 'Roboto Mono',
    src: 'https://fonts.gstatic.com/s/robotomono/v23/L0x5DF4xlVMF-BfR8bXMIjhGq3-cXbKDO1w.ttf',
});


// Define styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    backgroundColor: '#fff',
    padding: 5,
  },
  card: {
    width: 390,
    height: 590,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 70,
    backgroundColor: 'rgba(255, 153, 51, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#FF9933',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748B',
  },
  statusContainer: {
    marginLeft: 'auto',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 8,
    fontWeight: 700,
    color: '#FFFFFF',
    backgroundColor: '#4CAF50', // Default approved
  },
  rejectedBadge: {
    backgroundColor: '#E53E3E',
  },
  checkedInBadge: {
    backgroundColor: '#C6F6D5',
    color: '#22543D',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 20,
  },
  riderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 15,
    backgroundColor: '#E5E7EB', // Fallback color
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    color: '#9CA3AF'
  },
  riderTextContainer: {
    flexDirection: 'column',
  },
  riderName: {
    fontSize: 18,
    fontWeight: 700,
  },
  riderInfo: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  qrSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  regInfoContainer: {
    flexDirection: 'column',
  },
  regLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748B',
    marginBottom: 5,
  },
  regValue: {
    fontSize: 18,
    fontWeight: 700,
    textTransform: 'capitalize',
    marginBottom: 15,
  },
  regId: {
    fontFamily: 'Roboto Mono',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  qrCode: {
    width: 120,
    height: 120,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
    marginTop: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerColumn: {
    flexDirection: 'column',
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 12,
    color: '#64748B',
  },
});

const generateQrCodeUrl = (text: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
}

interface PdfTicketProps {
  data: {
    registrationId: string;
    riderNumber: 1 | 2;
    registrationType: 'solo' | 'duo';
    status: string;
    isCheckedIn: boolean;
    riderName: string;
    riderAge: number;
    riderPhone: string;
    photoUrl: string | null | undefined;
  }
}

export const PdfTicketDocument = ({ data }: PdfTicketProps) => {
  const isDuo = data.registrationType === 'duo';
  const qrData = JSON.stringify({ registrationId: data.registrationId, rider: data.riderNumber });

  return (
    <Document title={`Ride-Ticket-${data.riderName}`}>
      <Page size={{width: 400, height: 600}} style={styles.page}>
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Image style={styles.logo} src="https://res.cloudinary.com/dfk9licqv/image/upload/v1721749595/RideRegister/Logo_xjan6k.png" />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>TeleFun Mobile</Text>
                <Text style={styles.headerSubtitle}>Independence Day Ride 2025</Text>
              </View>
              <View style={styles.statusContainer}>
                  <Text style={[styles.statusBadge, data.status !== 'approved' && styles.rejectedBadge]}>
                      {data.status.toUpperCase()}
                  </Text>
                  {data.isCheckedIn && (
                      <Text style={[styles.statusBadge, styles.checkedInBadge]}>CHECKED-IN</Text>
                  )}
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>Your Ride Ticket {isDuo ? `(Rider ${data.riderNumber})` : ''}</Text>
              <Text style={styles.description}>Present this ticket at the check-in counter.</Text>
              
              <View style={styles.riderDetails}>
                <View style={styles.avatarContainer}>
                   {data.photoUrl ? (
                    <Svg width="64" height="64">
                      <Defs>
                        <ClipPath id="clipCircle">
                          <Circle cx="32" cy="32" r="32" />
                        </ClipPath>
                      </Defs>
                      <Image
                        src={data.photoUrl}
                        style={styles.avatar}
                        clipPath="url(#clipCircle)"
                      />
                    </Svg>
                    ) : (
                    <Text>USER</Text> 
                   )}
                </View>
                <View style={styles.riderTextContainer}>
                  <Text style={styles.riderName}>{data.riderName}</Text>
                  <Text style={styles.riderInfo}>{data.riderAge} years</Text>
                  <Text style={styles.riderInfo}>{data.riderPhone}</Text>
                </View>
              </View>

              <View style={styles.qrSection}>
                  <View style={styles.regInfoContainer}>
                    <Text style={styles.regLabel}>Reg. Type</Text>
                    <Text style={styles.regValue}>{data.registrationType}</Text>
                    <Text style={styles.regLabel}>Reg. ID</Text>
                    <Text style={styles.regId}>{data.registrationId.substring(0, 10)}</Text>
                  </View>
                  <Image style={styles.qrCode} src={generateQrCodeUrl(qrData)} />
              </View>

              <View style={styles.separator} />

              <View style={styles.footer}>
                  <View style={styles.footerColumn}>
                      <Text style={styles.footerLabel}>Date</Text>
                      <Text style={styles.footerValue}>August 15, 2025</Text>
                  </View>
                  <View style={styles.footerColumn}>
                      <Text style={styles.footerLabel}>Assembly Time</Text>
                      <Text style={styles.footerValue}>6:00 AM</Text>
                  </View>
              </View>
              <View style={[styles.footer, { marginTop: 20 }]}>
                   <View style={styles.footerColumn}>
                      <Text style={styles.footerLabel}>Starting Point</Text>
                      <Text style={styles.footerValue}>Telefun Mobiles: Mahadevpet, Madikeri</Text>
                  </View>
              </View>
            </View>
        </View>
      </Page>
    </Document>
  );
};
