import express from 'express'
import Scheme from '../models/Scheme.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ name: 1 })
    res.json(schemes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/seed', async (req, res) => {
  try {
    const schemes = [
      {
        name: 'Janani Suraksha Yojana',
        ageRange: 'Pregnant women',
        description: 'Safe motherhood intervention promoting institutional delivery.',
        eligibility: 'Pregnant women eligible under JSY guidelines, with categories varying by low-performing and high-performing states.',
        benefits: 'Cash assistance for institutional delivery support.',
        category: 'Maternal Health',
        officialLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&lid=309&sublinkid=841',
        source: 'National Health Mission',
      },
      {
        name: 'Pradhan Mantri Matru Vandana Yojana',
        ageRange: '19+',
        description: 'Maternity benefit scheme for pregnant and lactating women.',
        eligibility: 'Pregnant and lactating women, with benefit rules for first child and second child if girl child.',
        benefits: '₹5,000 for first child; ₹6,000 for second child if girl child.',
        category: 'Maternal Health',
        officialLink: 'https://www.myscheme.gov.in/schemes/pmmvy',
        source: 'myScheme / Government of India',
      },
      {
        name: 'Ayushman Bharat PM-JAY',
        ageRange: 'All ages',
        description: 'Cashless health insurance coverage for poor and vulnerable families.',
        eligibility: 'Eligible poor and vulnerable households as per PM-JAY criteria.',
        benefits: 'Health coverage up to ₹5 lakh per family per year for secondary and tertiary hospitalization.',
        category: 'Health Insurance',
        officialLink: 'https://www.myscheme.gov.in/schemes/ab-pmjay',
        source: 'myScheme / Government of India',
      },
      {
        name: 'Janani Shishu Suraksha Karyakram',
        ageRange: 'Pregnant women and sick infants',
        description: 'Scheme to reduce out-of-pocket expenditure for pregnant women and sick infants.',
        eligibility: 'Pregnant women and sick infants accessing public health institutions.',
        benefits: 'Free delivery, free C-section, drugs, diagnostics, diet, blood, transport, and exemption from user charges.',
        category: 'Maternal and Child Health',
        officialLink: 'https://nhm.gov.in/index1.php?lang=1&level=3&lid=308&sublinkid=842',
        source: 'National Health Mission',
      },
      {
        name: 'Mission Indradhanush',
        ageRange: 'Children and pregnant women',
        description: 'Immunization drive to improve full immunization coverage.',
        eligibility: 'Unvaccinated or partially vaccinated children and pregnant women in target areas.',
        benefits: 'Vaccination coverage through special immunization drives.',
        category: 'Immunization',
        officialLink: 'https://nhm.gov.in/index1.php?lang=1&level=2&lid=220&sublinkid=824',
        source: 'National Health Mission',
      },
      {
  name: "Pradhan Mantri Surakshit Matritva Abhiyan",
  ageRange: "Pregnant women",
  description: "Free antenatal check-ups for pregnant women every month.",
  eligibility: "All pregnant women in 2nd and 3rd trimester",
  benefits: "Free checkups, diagnostics, risk identification",
  category: "Maternal Health",
  officialLink: "https://pmsma.mohfw.gov.in/",
  source: "Ministry of Health & Family Welfare"
},
{
  name: "SUMAN (Surakshit Matritva Aashwasan)",
  ageRange: "Pregnant women & newborns",
  description: "Ensures free and respectful maternal healthcare services.",
  eligibility: "Women visiting public health facilities",
  benefits: "Free maternal care, zero denial of services",
  category: "Maternal Health",
  officialLink: "https://nhm.gov.in/",
  source: "National Health Mission"
},
{
  name: "POSHAN Abhiyaan",
  ageRange: "Women & children",
  description: "National nutrition mission to improve maternal and child health.",
  eligibility: "Pregnant women, lactating mothers, children",
  benefits: "Nutrition support, monitoring, supplements",
  category: "Nutrition",
  officialLink: "https://poshanabhiyaan.gov.in/",
  source: "Government of India"
},
{
  name: "Ayushman Bharat Digital Mission",
  ageRange: "All ages",
  description: "Digital health ID system for storing medical records.",
  eligibility: "All citizens",
  benefits: "Digital health records, easy access to care",
  category: "Digital Health",
  officialLink: "https://abdm.gov.in/",
  source: "Government of India"
},
{
  name: "Ayushman Bharat Digital Mission",
  ageRange: "All ages",
  description: "Digital health ID system for storing medical records.",
  eligibility: "All citizens",
  benefits: "Digital health records, easy access to care",
  category: "Digital Health",
  officialLink: "https://abdm.gov.in/",
  source: "Government of India"
},
{
  name: "PM CARES for Children",
  ageRange: "Children",
  description: "Support scheme for children affected by crises.",
  eligibility: "Eligible orphaned children",
  benefits: "₹10 lakh fund + ₹5 lakh health insurance",
  category: "Child Welfare",
  officialLink: "https://pmcaresforchildren.in/",
  source: "Government of India"
},
{
  name: "PM Ayushman Bharat Health Infrastructure Mission",
  ageRange: "All ages",
  description: "Strengthens public healthcare infrastructure.",
  eligibility: "Public health system",
  benefits: "Hospitals, labs, health workforce expansion",
  category: "Healthcare Infrastructure",
  officialLink: "https://www.mohfw.gov.in/",
  source: "Government of India"
},
{
  name: "PM Ayushman Bharat Health Infrastructure Mission",
  ageRange: "All ages",
  description: "Strengthens public healthcare infrastructure.",
  eligibility: "Public health system",
  benefits: "Hospitals, labs, health workforce expansion",
  category: "Healthcare Infrastructure",
  officialLink: "https://www.mohfw.gov.in/",
  source: "Government of India"
},
]

    await Scheme.deleteMany({})
    const saved = await Scheme.insertMany(schemes)

    res.status(201).json({
      message: 'Schemes seeded successfully',
      count: saved.length,
      data: saved,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router