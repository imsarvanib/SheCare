import User from '../models/User.js'
import Scheme from '../models/Scheme.js'

const seedTestUser = async () => {
  try {
    const testEmail = 'test@shecare.com'
    const existingUser = await User.findOne({ email: testEmail })

    if (existingUser) {
      console.log(`[Seed] Test user with email ${testEmail} already exists`)
      return
    }

    const testUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'test123',
      role: 'user',
    })

    console.log(`[Seed] Test user created successfully:`, {
      email: testUser.email,
      role: testUser.role,
    })
  } catch (error) {
    console.error('[Seed] Error creating test user:', error.message)
  }
}

const seedSchemes = async () => {
  try {
    const existingSchemes = await Scheme.countDocuments()

    if (existingSchemes > 0) {
      console.log(`[Seed] Healthcare schemes already exist (${existingSchemes} found)`)
      return
    }

    const schemeData = [
      {
        name: 'Janani Suraksha Yojana',
        ageRange: '18-45',
        category: 'Maternal Health',
        description:
          'Cash assistance program designed to promote institutional delivery and reduce maternal and infant mortality.',
        eligibility:
          'Pregnant women below poverty line, all institutional deliveries in public health centers and accredited private hospitals',
        benefits:
          'Cash assistance to mother (₹1400) and ASHA worker (₹600) for safe delivery, free delivery services',
        officialLink: 'https://www.nhm.gov.in/index1.php?lang=1&level=1&sublinkid=472&lid=223',
        source: 'Ministry of Health & Family Welfare, Government of India',
      },
      {
        name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
        ageRange: '19-40',
        category: 'Maternal Health',
        description:
          'Maternity benefit scheme providing direct cash transfer to pregnant women for wage compensation during pregnancy and lactation.',
        eligibility:
          'First live birth; pregnant women in all states; ₹5,000 direct cash transfer in installments',
        benefits:
          'First installment: ₹1,000 after registration during first trimester; Second installment: ₹2,000 after antenatal check-up after 6 months; Third installment: ₹2,000 after birth registration',
        officialLink: 'https://www.pmmvy.nic.in/',
        source: 'Ministry of Women & Child Development, Government of India',
      },
      {
        name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
        ageRange: 'All ages',
        category: 'General Healthcare',
        description:
          'World\'s largest health insurance scheme providing hospitalization coverage for secondary and tertiary care.',
        eligibility:
          'Low-income eligible households; approximately 50 crore beneficiaries; based on SECC database and state specific criteria',
        benefits:
          'Coverage up to ₹5 lakh per family per annum, free health services at empaneled hospitals, no cap on number of admissions',
        officialLink: 'https://pmjay.gov.in/',
        source: 'Ministry of Labor & Employment, Government of India',
      },
      {
        name: 'Rashtriya Kishor Swasthya Karyakram (RKSK)',
        ageRange: '10-19',
        category: 'Adolescent Health',
        description:
          'Comprehensive adolescent health program providing counseling, preventive care, and health services for girls and boys.',
        eligibility:
          'All adolescent girls and boys aged 10-19 years; available in government health facilities nationwide',
        benefits:
          'Free health counseling, reproductive health services, mental health support, nutritional guidance, anemia screening and treatment',
        officialLink: 'https://www.nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1015&lid=352',
        source: 'Ministry of Health & Family Welfare, Government of India',
      },
      {
        name: 'Mission Indradhanush',
        ageRange: 'Birth - 2 years',
        category: 'Child Health & Immunization',
        description:
          'Convergent immunization campaign to vaccinate children and pregnant women against vaccine-preventable diseases.',
        eligibility:
          'Children up to 2 years of age, pregnant women, available in all states with focus on high-priority districts',
        benefits:
          'Free immunization vaccines, improved vaccination coverage, tracking and monitoring of immunization status',
        officialLink: 'https://www.nhm.gov.in/index1.php?lang=1&level=1&sublinkid=511&lid=256',
        source: 'Ministry of Health & Family Welfare, Government of India',
      },
      {
        name: 'POSHAN Abhiyaan',
        ageRange: 'Pregnant women & children',
        category: 'Nutrition',
        description:
          'National nutrition mission targeting malnutrition among women and children through convergent action.',
        eligibility:
          'Pregnant and lactating women, children 0-6 years, adolescent girls; multi-sectoral approach covering 315 districts',
        benefits:
          'Nutrition counseling, supplementary nutrition, health check-ups, growth monitoring, behavior change communication',
        officialLink: 'https://poshan.nic.in/',
        source: 'Ministry of Women & Child Development, Government of India',
      },
      {
        name: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
        ageRange: '18-45',
        category: 'Maternal Health',
        description:
          'Safe motherhood scheme providing comprehensive antenatal care through safe and dignified delivery practices.',
        eligibility:
          'All pregnant women, especially those on 9th day of each month at government health facilities',
        benefits:
          'Free antenatal check-ups, free delivery services, emergency obstetric care, post-natal care, mother and child follow-up',
        officialLink: 'https://www.nhm.gov.in/index1.php?lang=1&level=1&sublinkid=510&lid=256',
        source: 'Ministry of Health & Family Welfare, Government of India',
      },
    ]

    const createdSchemes = await Scheme.insertMany(schemeData)

    console.log(`[Seed] ${createdSchemes.length} healthcare schemes seeded successfully`)
  } catch (error) {
    console.error('[Seed] Error seeding schemes:', error.message)
  }
}

export const runAllSeeds = async () => {
  console.log('[Seed] Starting database seeding...')
  await seedTestUser()
  await seedSchemes()
  console.log('[Seed] Database seeding completed')
}

export default seedTestUser
