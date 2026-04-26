const UserModel = require('../models/userModels')
const bcryptjs = require('bcryptjs')

const seedDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@blinkit.com'
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'BlinkitAdmin123!'

    // Check if any admin already exists
    const existingAdmin = await UserModel.findOne({ role: 'ADMIN' })
    if (existingAdmin) {
      console.log('Admin already exists, skipping seed')
      return
    }

    // Check if default admin email already registered as USER
    const existingUser = await UserModel.findOne({ email: adminEmail })
    if (existingUser) {
      // Promote to admin
      existingUser.role = 'ADMIN'
      await existingUser.save()
      console.log('Existing user promoted to admin:', adminEmail)
      return
    }

    // Create default admin
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(adminPassword, salt)

    const adminUser = new UserModel({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      verify_email: true,
      status: 'Active'
    })

    await adminUser.save()
    console.log('Default admin created:', adminEmail)
    console.log('Default admin password:', adminPassword)
    console.log('Please change the default password after first login!')
  } catch (error) {
    console.error('Error seeding admin:', error.message)
  }
}

module.exports = seedDefaultAdmin

