/**
 * NavEd Open House Exhibition Document Generator
 * Generates a professional Word document for presentation
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  ImageRun,
} = require('docx');
const fs = require('fs');
const path = require('path');

// Color scheme
const COLORS = {
  primary: '2563EB',      // Blue
  secondary: '64748B',    // Slate
  accent: '10B981',       // Green
  dark: '1F2937',         // Dark gray
  light: 'F3F4F6',        // Light gray
  white: 'FFFFFF',
};

// Helper to create styled heading
function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text: text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

// Helper to create body paragraph
function createParagraph(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: options.size || 24,
        font: 'Calibri',
        color: options.color || COLORS.dark,
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
    spacing: { after: 200 },
    alignment: options.alignment || AlignmentType.LEFT,
  });
}

// Helper to create bullet point
function createBullet(text, level = 0) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: 24,
        font: 'Calibri',
      }),
    ],
    bullet: { level: level },
    spacing: { after: 100 },
  });
}

// Helper to create a feature box
function createFeatureSection(title, description, features) {
  const children = [
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 28,
          color: COLORS.primary,
          font: 'Calibri',
        }),
      ],
      spacing: { before: 300, after: 100 },
    }),
    createParagraph(description, { italics: true, color: COLORS.secondary }),
  ];

  features.forEach(feature => {
    children.push(createBullet(feature));
  });

  return children;
}

// Create the document
async function generateDocument() {
  const doc = new Document({
    creator: 'NavEd Team',
    title: 'NavEd - Campus Navigation & Study Assistant',
    description: 'Open House Exhibition Presentation Document',
    styles: {
      default: {
        heading1: {
          run: {
            size: 48,
            bold: true,
            color: COLORS.primary,
            font: 'Calibri',
          },
          paragraph: {
            spacing: { before: 400, after: 200 },
          },
        },
        heading2: {
          run: {
            size: 36,
            bold: true,
            color: COLORS.dark,
            font: 'Calibri',
          },
          paragraph: {
            spacing: { before: 350, after: 150 },
          },
        },
        heading3: {
          run: {
            size: 28,
            bold: true,
            color: COLORS.secondary,
            font: 'Calibri',
          },
          paragraph: {
            spacing: { before: 300, after: 100 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'NavEd - Open House Exhibition 2026',
                    size: 20,
                    color: COLORS.secondary,
                    font: 'Calibri',
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'University of Central Punjab | NavEd v1.0.0',
                    size: 18,
                    color: COLORS.secondary,
                    font: 'Calibri',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          // ==================== COVER PAGE ====================
          new Paragraph({ spacing: { before: 2000 } }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'NavEd',
                bold: true,
                size: 96,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Campus Navigation & Study Assistant',
                size: 36,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                size: 24,
                color: COLORS.light,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Open House Exhibition 2026',
                size: 32,
                color: COLORS.accent,
                font: 'Calibri',
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'University of Central Punjab',
                size: 28,
                color: COLORS.secondary,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Lahore, Pakistan',
                size: 24,
                color: COLORS.secondary,
                font: 'Calibri',
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 800 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Built with Free & Open-Source Technologies',
                size: 22,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'React Native  •  Expo  •  MapLibre  •  OpenStreetMap  •  Gemini AI',
                size: 20,
                color: COLORS.secondary,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== TABLE OF CONTENTS ====================
          createHeading('Table of Contents', HeadingLevel.HEADING_1),

          createParagraph('1. Executive Summary ...................................... 3'),
          createParagraph('2. Problem Statement ...................................... 4'),
          createParagraph('3. Our Solution - NavEd ................................... 5'),
          createParagraph('4. Key Features Overview .................................. 6'),
          createParagraph('5. Feature Details'),
          createParagraph('    5.1 Campus Map & Navigation ........................... 7'),
          createParagraph('    5.2 Smart Parking System .............................. 9'),
          createParagraph('    5.3 AI Study Assistant ................................ 11'),
          createParagraph('    5.4 Accessibility Features ............................ 13'),
          createParagraph('6. Technology Stack ....................................... 14'),
          createParagraph('7. Budget-Friendly Approach ............................... 15'),
          createParagraph('8. Target Users ........................................... 16'),
          createParagraph('9. Future Roadmap ......................................... 17'),
          createParagraph('10. Team & Contact ........................................ 18'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== EXECUTIVE SUMMARY ====================
          createHeading('1. Executive Summary', HeadingLevel.HEADING_1),

          createParagraph(
            'NavEd is a comprehensive mobile application designed to revolutionize the campus experience at the University of Central Punjab. Our app combines three essential functionalities into one seamless platform: intelligent campus navigation with 3D building visualization, crowdsourced parking management with predictive analytics, and an AI-powered study assistant that helps students learn more effectively.'
          ),

          createParagraph(
            'What sets NavEd apart is our commitment to accessibility and budget-consciousness. Every feature is built using free and open-source technologies, making it sustainable for educational institutions. The app is designed with accessibility-first principles, ensuring students with disabilities can navigate campus independently with voice guidance, haptic feedback, and high-contrast modes.'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Key Highlights:',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 150 },
          }),

          createBullet('Interactive 3D campus map with building extrusions (similar to Apple Maps)'),
          createBullet('Real-time parking availability with community-driven updates'),
          createBullet('AI chatbot for document analysis, quiz generation, and study planning'),
          createBullet('Full accessibility support: voice guidance, haptics, screen reader compatibility'),
          createBullet('100% free technology stack - no recurring API costs'),
          createBullet('Cross-platform: Android, iOS, and Web support'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== PROBLEM STATEMENT ====================
          createHeading('2. Problem Statement', HeadingLevel.HEADING_1),

          createParagraph(
            'University campuses present numerous challenges for students, faculty, and visitors. Through extensive surveys and feedback collection, we identified the following critical pain points:'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Navigation Challenges',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('New students struggle to find classrooms, especially in the first weeks'),
          createBullet('Visitors and parents get lost during events and open houses'),
          createBullet('No indoor navigation for finding specific rooms within buildings'),
          createBullet('Students with disabilities lack accessible route information'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Parking Frustrations',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Students waste 15-20 minutes daily searching for parking'),
          createBullet('No real-time visibility into parking lot availability'),
          createBullet('Forgetting where the vehicle was parked is common'),
          createBullet('IoT parking sensors are expensive (PKR 50,000+ per lot)'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Study Inefficiencies',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Students struggle to create effective study plans'),
          createBullet('Manual quiz creation is time-consuming for self-assessment'),
          createBullet('Paid AI tools (ChatGPT Plus) are unaffordable for many students'),
          createBullet('No integrated solution combining navigation and academics'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== OUR SOLUTION ====================
          createHeading('3. Our Solution - NavEd', HeadingLevel.HEADING_1),

          createParagraph(
            'NavEd addresses all these challenges with an integrated, accessible, and budget-friendly mobile application. Our solution leverages cutting-edge technologies while remaining completely free to deploy and maintain.'
          ),

          // Solution Architecture Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Challenge', bold: true, size: 24 })] })],
                    shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'NavEd Solution', bold: true, size: 24 })] })],
                    shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                    width: { size: 35, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Technology', bold: true, size: 24 })] })],
                    shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                    width: { size: 35, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Campus Navigation')] }),
                  new TableCell({ children: [createParagraph('3D Interactive Map with turn-by-turn directions')] }),
                  new TableCell({ children: [createParagraph('MapLibre + OpenStreetMap (FREE)')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Parking Discovery')] }),
                  new TableCell({ children: [createParagraph('Crowdsourced availability + AI predictions')] }),
                  new TableCell({ children: [createParagraph('Community Reports + ML (FREE)')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Study Assistance')] }),
                  new TableCell({ children: [createParagraph('AI chatbot with quiz & study plan generation')] }),
                  new TableCell({ children: [createParagraph('Gemini AI Free Tier (FREE)')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Accessibility')] }),
                  new TableCell({ children: [createParagraph('Voice guidance, haptics, high contrast')] }),
                  new TableCell({ children: [createParagraph('Device TTS + Expo APIs (FREE)')] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== KEY FEATURES OVERVIEW ====================
          createHeading('4. Key Features Overview', HeadingLevel.HEADING_1),

          createParagraph(
            'NavEd is organized into four main sections, each accessible from the bottom navigation bar:'
          ),

          // Feature cards
          new Paragraph({
            children: [
              new TextRun({
                text: '📍 Campus Map',
                bold: true,
                size: 32,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 100 },
          }),
          createParagraph('Interactive 3D map of UCP campus with building search, accessibility filters, turn-by-turn navigation, and video route guides.'),

          new Paragraph({
            children: [
              new TextRun({
                text: '🚗 Smart Parking',
                bold: true,
                size: 32,
                color: COLORS.accent,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createParagraph('Real-time parking availability, crowdsourced updates, predictive analytics, vehicle location saving, and one-tap navigation to your car.'),

          new Paragraph({
            children: [
              new TextRun({
                text: '📚 Study Assistant',
                bold: true,
                size: 32,
                color: 'F59E0B',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createParagraph('Upload documents, chat with AI about content, generate quizzes automatically, create personalized study plans—all using free AI APIs.'),

          new Paragraph({
            children: [
              new TextRun({
                text: '⚙️ Settings & Accessibility',
                bold: true,
                size: 32,
                color: COLORS.secondary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createParagraph('Dark/light themes, font scaling (S/M/L/XL), high contrast mode, voice guidance with adjustable speed, and haptic feedback.'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== CAMPUS MAP DETAILS ====================
          createHeading('5. Feature Details', HeadingLevel.HEADING_1),
          createHeading('5.1 Campus Map & Navigation', HeadingLevel.HEADING_2),

          createParagraph(
            'The Campus Map is the heart of NavEd, providing an immersive navigation experience similar to Apple Maps and Google Maps.'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: '3D Building Visualization',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Buildings rendered as 3D extrusions with accurate heights'),
          createBullet('Color-coded by category: Academic (Blue), Library (Amber), Cafeteria (Orange), Sports (Green)'),
          createBullet('Tap buildings to select and view details'),
          createBullet('Toggle between 3D and 2D views with one tap'),
          createBullet('Smooth camera animations and gestures'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Building Search & Discovery',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Search by building name, code, or room number'),
          createBullet('Filter by category (Academic, Administrative, Library, etc.)'),
          createBullet('Filter for wheelchair-accessible buildings only'),
          createBullet('View building details: floors, facilities, operating hours'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Turn-by-Turn Navigation',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Get walking directions to any building'),
          createBullet('Route visualization with highlighted path on map'),
          createBullet('Step-by-step instructions with distance and time'),
          createBullet('Voice guidance for hands-free navigation (accessibility)'),
          createBullet('Video route guides for complex paths'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Accessibility Features',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Wheelchair-accessible route filtering'),
          createBullet('Building accessibility badges: ramps, elevators, braille, wide doors'),
          createBullet('Voice announcements for each navigation step'),
          createBullet('High contrast map markers for visual impairment'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Campus Map - Technical Details
          new Paragraph({
            children: [
              new TextRun({
                text: 'Technical Implementation',
                bold: true,
                size: 26,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Component', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Technology', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Cost', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Map Rendering')] }),
                  new TableCell({ children: [createParagraph('MapLibre GL Native')] }),
                  new TableCell({ children: [createParagraph('FREE (Open Source)')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Map Tiles')] }),
                  new TableCell({ children: [createParagraph('OpenFreeMap / OpenStreetMap')] }),
                  new TableCell({ children: [createParagraph('FREE')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Routing Engine')] }),
                  new TableCell({ children: [createParagraph('OSRM (Open Source Routing Machine)')] }),
                  new TableCell({ children: [createParagraph('FREE')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('3D Buildings')] }),
                  new TableCell({ children: [createParagraph('FillExtrusionLayer (MapLibre)')] }),
                  new TableCell({ children: [createParagraph('FREE')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Location Services')] }),
                  new TableCell({ children: [createParagraph('Expo Location (Device GPS)')] }),
                  new TableCell({ children: [createParagraph('FREE')] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Campus Data Coverage',
                bold: true,
                size: 26,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 150 },
          }),

          createBullet('24 campus buildings with detailed footprints'),
          createBullet('Building categories: Academic, Administrative, Library, Cafeteria, Sports, Hostel, Medical'),
          createBullet('Room-level data: Classrooms, Labs, Offices, Auditoriums'),
          createBullet('Accessibility information for each building'),
          createBullet('Operating hours and facility lists'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== PARKING SYSTEM ====================
          createHeading('5.2 Smart Parking System', HeadingLevel.HEADING_2),

          createParagraph(
            'Our innovative parking system uses crowdsourcing instead of expensive IoT sensors, making it budget-friendly while still providing real-time information.'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Real-Time Availability',
                bold: true,
                size: 26,
                color: COLORS.accent,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('View all parking lots with current availability'),
          createBullet('Color-coded status: Available (Green), Filling Up (Orange), Full (Red)'),
          createBullet('Visual progress bar showing occupancy percentage'),
          createBullet('Last updated timestamp for transparency'),
          createBullet('Pull-to-refresh for instant updates'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Crowdsourced Updates',
                bold: true,
                size: 26,
                color: COLORS.accent,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Users can report current availability with one tap'),
          createBullet('Weighted averaging based on report recency'),
          createBullet('Community-driven data—no hardware required'),
          createBullet('"Help Your Community" engagement banner'),
          createBullet('Confidence scoring for data reliability'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'AI Predictive Analytics',
                bold: true,
                size: 26,
                color: COLORS.accent,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Machine learning predictions based on historical patterns'),
          createBullet('Peak hour analysis (morning rush, lunch, evening)'),
          createBullet('Personalized recommendations: "Best time to arrive"'),
          createBullet('Day-of-week trend analysis'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Vehicle Location Memory',
                bold: true,
                size: 26,
                color: COLORS.accent,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Save exactly where you parked with one tap'),
          createBullet('Optional spot number and notes (e.g., "Level 2, near stairs")'),
          createBullet('Shows time elapsed since parking'),
          createBullet('"Navigate to Vehicle" opens native maps app'),
          createBullet('Works with Google Maps (Android) and Apple Maps (iOS)'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Parking - How it Works
          new Paragraph({
            children: [
              new TextRun({
                text: 'How Crowdsourcing Works',
                bold: true,
                size: 26,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),

          createParagraph(
            'Instead of installing expensive parking sensors (PKR 50,000+ per lot), NavEd leverages the power of community reporting:'
          ),

          createParagraph('1. User arrives at parking lot and sees available spots'),
          createParagraph('2. User taps "Report Availability" and enters the count'),
          createParagraph('3. System weighs the report based on recency (newer = higher weight)'),
          createParagraph('4. Multiple reports are averaged for accuracy'),
          createParagraph('5. Historical data trains the prediction model'),
          createParagraph('6. All users benefit from real-time community data'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Cost Comparison',
                bold: true,
                size: 26,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 150 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Solution', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Initial Cost', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Monthly Cost', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('IoT Sensors (per lot)')] }),
                  new TableCell({ children: [createParagraph('PKR 50,000+')] }),
                  new TableCell({ children: [createParagraph('PKR 5,000+ maintenance')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Camera-based System')] }),
                  new TableCell({ children: [createParagraph('PKR 200,000+')] }),
                  new TableCell({ children: [createParagraph('PKR 10,000+ cloud')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'NavEd Crowdsourcing', bold: true, size: 24, color: COLORS.accent })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'PKR 0', bold: true, size: 24, color: COLORS.accent })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'PKR 0', bold: true, size: 24, color: COLORS.accent })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== STUDY ASSISTANT ====================
          createHeading('5.3 AI Study Assistant', HeadingLevel.HEADING_2),

          createParagraph(
            'The Study Assistant transforms how students interact with their course materials using free AI technologies. Upload any document and let AI help you learn.'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Document Management',
                bold: true,
                size: 26,
                color: 'F59E0B',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Upload PDFs, Word documents (.doc, .docx), and text files'),
          createBullet('Maximum file size: 10MB per document'),
          createBullet('Documents stored locally on device (privacy-first)'),
          createBullet('View document list with file sizes and upload dates'),
          createBullet('Delete documents with confirmation prompt'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'AI Chat Interface',
                bold: true,
                size: 26,
                color: 'F59E0B',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Natural language Q&A about document content'),
          createBullet('RAG (Retrieval-Augmented Generation) for accurate answers'),
          createBullet('Chat history saved per document'),
          createBullet('Real-time AI responses'),
          createBullet('Conversation context maintained across sessions'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Automatic Quiz Generation',
                bold: true,
                size: 26,
                color: 'F59E0B',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('One-tap quiz creation from any document'),
          createBullet('Multiple choice questions (typically 5 per quiz)'),
          createBullet('Instant feedback: correct (green) / incorrect (red)'),
          createBullet('Detailed explanations for each answer'),
          createBullet('Score calculation and display'),
          createBullet('Great for exam preparation and self-assessment'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Study Plan Generation',
                bold: true,
                size: 26,
                color: 'F59E0B',
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('AI creates personalized study schedules'),
          createBullet('Breaks down content into learning objectives'),
          createBullet('Structured sessions with topics and time allocations'),
          createBullet('Timeline-based progress tracking'),
          createBullet('"Start Studying" button for engagement'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Study Assistant - AI Providers
          new Paragraph({
            children: [
              new TextRun({
                text: 'Free AI Provider Support',
                bold: true,
                size: 26,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 200, after: 150 },
          }),

          createParagraph(
            'NavEd supports multiple free AI providers, ensuring students always have access to AI assistance without subscription costs:'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Provider', bold: true, size: 22 })] })],
                    shading: { fill: 'F59E0B', type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Free Tier', bold: true, size: 22 })] })],
                    shading: { fill: 'F59E0B', type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Best For', bold: true, size: 22 })] })],
                    shading: { fill: 'F59E0B', type: ShadingType.CLEAR },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Google Gemini (Default)')] }),
                  new TableCell({ children: [createParagraph('15 requests/minute')] }),
                  new TableCell({ children: [createParagraph('General Q&A, summaries')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Groq')] }),
                  new TableCell({ children: [createParagraph('Free inference API')] }),
                  new TableCell({ children: [createParagraph('Fast responses')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('HuggingFace')] }),
                  new TableCell({ children: [createParagraph('Open source models')] }),
                  new TableCell({ children: [createParagraph('Privacy-conscious')] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'How RAG Works',
                bold: true,
                size: 26,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 150 },
          }),

          createParagraph(
            'RAG (Retrieval-Augmented Generation) ensures accurate, document-specific answers:'
          ),

          createParagraph('1. Document is uploaded and text is extracted'),
          createParagraph('2. Text is chunked into manageable segments'),
          createParagraph('3. User asks a question about the content'),
          createParagraph('4. Relevant chunks are retrieved based on the query'),
          createParagraph('5. AI generates response using only the retrieved context'),
          createParagraph('6. Result: Accurate answers grounded in your actual documents'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== ACCESSIBILITY ====================
          createHeading('5.4 Accessibility Features', HeadingLevel.HEADING_2),

          createParagraph(
            'NavEd is designed with accessibility as a core principle, not an afterthought. Every feature considers users with visual, auditory, motor, and cognitive disabilities.'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Visual Accessibility',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Dark Mode: Reduces eye strain and battery usage'),
          createBullet('Light Mode: High visibility in bright environments'),
          createBullet('System Mode: Automatically follows device preferences'),
          createBullet('High Contrast Mode: Enhanced visibility for low vision users'),
          createBullet('Font Scaling: Small, Medium, Large, Extra Large options'),
          createBullet('Screen Reader Compatible: VoiceOver (iOS) and TalkBack (Android)'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Voice Guidance',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Text-to-Speech for navigation instructions'),
          createBullet('Adjustable speech rate: 0.5x to 2.0x speed'),
          createBullet('Uses device native TTS engine (completely free)'),
          createBullet('Supports multiple languages'),
          createBullet('Test Voice button to preview settings'),
          createBullet('Turn-by-turn voice announcements while navigating'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Haptic Feedback',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Vibration feedback for button presses'),
          createBullet('Tactile confirmation for important actions'),
          createBullet('Three intensity levels: light, medium, success'),
          createBullet('Can be disabled for users who prefer no vibration'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Mobility Accessibility',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Wheelchair-accessible building filter'),
          createBullet('Accessible route prioritization'),
          createBullet('Building accessibility badges:'),
          createBullet('  • Wheelchair ramps', 1),
          createBullet('  • Elevators', 1),
          createBullet('  • Braille signage', 1),
          createBullet('  • Audio guidance systems', 1),
          createBullet('  • Wide doorways', 1),
          createBullet('  • Accessible washrooms', 1),
          createBullet('  • Tactile paving', 1),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== TECHNOLOGY STACK ====================
          createHeading('6. Technology Stack', HeadingLevel.HEADING_1),

          createParagraph(
            'NavEd is built entirely with modern, industry-standard technologies. The entire stack is free and open-source, making it sustainable for educational institutions.'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Frontend Framework',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('React Native 0.81.5 - Cross-platform mobile development'),
          createBullet('React 19.1.0 - UI component library'),
          createBullet('Expo SDK 54 - Development and build tooling'),
          createBullet('TypeScript - Type-safe JavaScript'),
          createBullet('React Navigation - Screen navigation and routing'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Mapping & Location',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('MapLibre GL Native - Open-source map rendering'),
          createBullet('OpenStreetMap - Free map tile data'),
          createBullet('OSRM - Open Source Routing Machine'),
          createBullet('Expo Location - Device GPS integration'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'AI & Machine Learning',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Google Gemini AI - Free tier language model'),
          createBullet('Groq - Free inference API'),
          createBullet('HuggingFace - Open source models'),
          createBullet('RAG System - Document retrieval and generation'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'UI/UX & Accessibility',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Expo Speech - Text-to-speech engine'),
          createBullet('Expo Haptics - Vibration feedback'),
          createBullet('React Native Reanimated - Smooth animations'),
          createBullet('Expo Linear Gradient - Gradient backgrounds'),
          createBullet('Material Icons - Consistent iconography'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Data Storage',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('AsyncStorage - Local device storage'),
          createBullet('Expo FileSystem - Document handling'),
          createBullet('Context API - Application state management'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== BUDGET FRIENDLY ====================
          createHeading('7. Budget-Friendly Approach', HeadingLevel.HEADING_1),

          createParagraph(
            'NavEd demonstrates that powerful, feature-rich applications can be built without expensive proprietary services. Here\'s our cost breakdown:'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Total Monthly Operating Cost: PKR 0',
                bold: true,
                size: 32,
                color: COLORS.accent,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Service', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.accent, type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Alternative', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.accent, type: ShadingType.CLEAR },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Savings', bold: true, size: 22 })] })],
                    shading: { fill: COLORS.accent, type: ShadingType.CLEAR },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Google Maps API')] }),
                  new TableCell({ children: [createParagraph('OpenStreetMap + MapLibre')] }),
                  new TableCell({ children: [createParagraph('$200+/month saved')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Mapbox Routing')] }),
                  new TableCell({ children: [createParagraph('OSRM (Open Source)')] }),
                  new TableCell({ children: [createParagraph('$100+/month saved')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('ChatGPT Plus')] }),
                  new TableCell({ children: [createParagraph('Gemini Free Tier')] }),
                  new TableCell({ children: [createParagraph('$20/user/month saved')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('IoT Parking Sensors')] }),
                  new TableCell({ children: [createParagraph('Crowdsourcing')] }),
                  new TableCell({ children: [createParagraph('PKR 50,000+ saved')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [createParagraph('Amazon Polly TTS')] }),
                  new TableCell({ children: [createParagraph('Device Native TTS')] }),
                  new TableCell({ children: [createParagraph('$50+/month saved')] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Why This Matters for Universities',
                bold: true,
                size: 26,
                color: COLORS.dark,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 150 },
          }),

          createBullet('No recurring subscription fees drain the budget'),
          createBullet('Can be deployed at any educational institution'),
          createBullet('Open-source components can be self-hosted'),
          createBullet('Scales to thousands of users without additional costs'),
          createBullet('Students can contribute to and learn from the codebase'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== TARGET USERS ====================
          createHeading('8. Target Users', HeadingLevel.HEADING_1),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Primary Users',
                bold: true,
                size: 28,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Students', bold: true, size: 24, font: 'Calibri' }),
              new TextRun({ text: ' - Navigate campus, find parking, study with AI', size: 24, font: 'Calibri' }),
            ],
            spacing: { after: 100 },
          }),
          createBullet('New students learning campus layout'),
          createBullet('Commuter students needing parking information'),
          createBullet('Students preparing for exams with AI assistance'),
          createBullet('Students with disabilities requiring accessible routes'),

          new Paragraph({
            children: [
              new TextRun({ text: 'Faculty & Staff', bold: true, size: 24, font: 'Calibri' }),
              new TextRun({ text: ' - Quick navigation and parking', size: 24, font: 'Calibri' }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          createBullet('Finding meeting rooms and offices'),
          createBullet('Checking parking availability before arriving'),
          createBullet('Guiding visitors to their offices'),

          new Paragraph({
            children: [
              new TextRun({ text: 'Visitors & Parents', bold: true, size: 24, font: 'Calibri' }),
              new TextRun({ text: ' - Campus exploration', size: 24, font: 'Calibri' }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          createBullet('Open house and admission tours'),
          createBullet('Parents visiting students'),
          createBullet('Event attendees finding venues'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Accessibility Users',
                bold: true,
                size: 28,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 150 },
          }),

          createBullet('Visually impaired users: Voice guidance, high contrast, screen readers'),
          createBullet('Mobility impaired users: Wheelchair-accessible routes and buildings'),
          createBullet('Hearing impaired users: Visual navigation, haptic feedback'),
          createBullet('Cognitive disabilities: Simple interface, clear instructions'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== FUTURE ROADMAP ====================
          createHeading('9. Future Roadmap', HeadingLevel.HEADING_1),

          createParagraph(
            'NavEd is continuously evolving. Here are the planned enhancements for future versions:'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Phase 1: Enhanced Navigation',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Indoor navigation with floor plans'),
          createBullet('AR (Augmented Reality) wayfinding'),
          createBullet('Real-time crowd density visualization'),
          createBullet('Emergency evacuation routes'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Phase 2: Smart Campus Integration',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Class schedule integration with auto-navigation'),
          createBullet('Event calendar with venue directions'),
          createBullet('Campus announcements and alerts'),
          createBullet('Integration with university LMS'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Phase 3: Advanced AI Features',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('Voice-controlled navigation ("Hey NavEd, take me to the library")'),
          createBullet('Personalized study recommendations'),
          createBullet('Collaborative study groups'),
          createBullet('Progress tracking and analytics'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Phase 4: Multi-Campus Support',
                bold: true,
                size: 26,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 300, after: 100 },
          }),
          createBullet('White-label solution for other universities'),
          createBullet('Campus data management portal'),
          createBullet('Inter-campus navigation for university systems'),
          createBullet('Community contribution platform'),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== TEAM & CONTACT ====================
          createHeading('10. Team & Contact', HeadingLevel.HEADING_1),

          createParagraph(
            'NavEd was developed as a Final Year Project at the University of Central Punjab, demonstrating the potential of student innovation in solving real campus challenges.'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Development Team',
                bold: true,
                size: 28,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          createParagraph('University of Central Punjab'),
          createParagraph('Faculty of Information Technology'),
          createParagraph('Final Year Project - 2025/2026'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Project Repository',
                bold: true,
                size: 28,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          createParagraph('GitHub: github.com/Asad-Jamshaid/NavEd'),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Acknowledgments',
                bold: true,
                size: 28,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          createBullet('Faculty Supervisor for guidance and support'),
          createBullet('UCP IT Department for campus data'),
          createBullet('Open-source community for amazing tools'),
          createBullet('Student beta testers for valuable feedback'),

          new Paragraph({ spacing: { before: 600 } }),

          new Paragraph({
            children: [
              new TextRun({
                text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                size: 24,
                color: COLORS.light,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Thank You for Visiting NavEd!',
                bold: true,
                size: 32,
                color: COLORS.primary,
                font: 'Calibri',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Download the app and experience smart campus navigation today.',
                size: 24,
                color: COLORS.secondary,
                font: 'Calibri',
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });

  // Generate the document
  const buffer = await Packer.toBuffer(doc);

  // Save to file
  const outputPath = path.join(__dirname, '..', 'NavEd_OpenHouse_Presentation.docx');
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ Document generated successfully!`);
  console.log(`📄 File saved to: ${outputPath}`);
}

// Run the generator
generateDocument().catch(console.error);
