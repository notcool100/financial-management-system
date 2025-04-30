const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new staff member
async function createStaff(req, res) {
  try {
    const { name, email, phone, role, status, passwordHash } = req.body;
    const newStaff = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: role || 'staff',
        passwordHash,
      },
    });
    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff' });
  }
}

// Get all staff members with optional filters
async function getStaff(req, res) {
  try {
    const { role, status, search } = req.query;
    const where = {
      role: { not: 'client' } // Exclude clients
    };

    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const staffList = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(staffList);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
}

// Get a single staff member by ID
async function getStaffById(req, res) {
  try {
    const { id } = req.params;
    const staff = await prisma.user.findUnique({
      where: { id },
    });
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    if (staff.role === 'client') {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff by ID:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
}

// Update a staff member by ID
async function updateStaff(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, role, passwordHash } = req.body;
    
    // First check if the user exists and is not a client
    const existingStaff = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingStaff || existingStaff.role === 'client') {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    const updatedStaff = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        role: role || existingStaff.role,
        passwordHash,
        updatedAt: new Date(),
      },
    });
    res.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  }
}

// Delete a staff member by ID
async function deleteStaff(req, res) {
  try {
    const { id } = req.params;
    
    // First check if the user exists and is not a client
    const existingStaff = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingStaff || existingStaff.role === 'client') {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
}

module.exports = {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};
