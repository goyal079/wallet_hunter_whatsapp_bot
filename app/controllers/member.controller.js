const { db } = require("../../config/database");
const { Op, Sequelize } = require("sequelize");

const memberController = {
  getMembers: async (req, res) => {
    try {
      const {
        samaj,
        gender,
        maritalStatus,
        ageMin,
        ageMax,
        bloodGroup,
        page = 1,
        limit = 10,
      } = req.query;

      // Build filter conditions
      const whereClause = {};

      if (samaj) {
        const samajRecord = await db.Samaj.findOne({ where: { name: samaj } });
        if (samajRecord) whereClause.samajId = samajRecord.id;
      }
      if (gender) whereClause.gender = gender;
      if (maritalStatus) whereClause.maritalStatus = maritalStatus;
      if (bloodGroup) whereClause.bloodGroup = bloodGroup;

      // Age range filter
      if (ageMin || ageMax) {
        whereClause.age = {};
        if (ageMin) whereClause.age[Op.gte] = parseInt(ageMin);
        if (ageMax) whereClause.age[Op.lte] = parseInt(ageMax);
      }

      const offset = (page - 1) * limit;

      const members = await db.Member.findAndCountAll({
        attributes: [
          "id", // UUID
          "name", // Full name
          "gender", // M/F/Other
          "age", // Numeric
          "bloodGroup", // Blood group
          "mobile1", // Primary mobile
          "mobile2", // Secondary mobile
          [Sequelize.col("samaj.name"), "samajName"], // Using imported Sequelize
        ],
        where: whereClause,
        include: [
          {
            model: db.Samaj,
            as: "samaj",
            attributes: [], // No separate samaj object in response
          },
        ],
        raw: true, // Get plain objects
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        total: members.count,
        totalPages: Math.ceil(members.count / limit),
        currentPage: parseInt(page),
        members: members.rows,
      });
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  },

  getMemberById: async (req, res) => {
    try {
      const member = await db.Member.findByPk(req.params.id, {
        include: [
          {
            model: db.Samaj,
            as: "samaj",
            attributes: ["name"],
          },
          {
            model: db.Family,
            as: "family",
            attributes: ["name", "lastName"],
          },
        ],
      });

      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }

      res.json(member);
    } catch (error) {
      console.error("Error fetching member:", error);
      res.status(500).json({ error: "Failed to fetch member" });
    }
  },

  getFilterOptions: async (req, res) => {
    try {
      const [samajList, ageRange] = await Promise.all([
        db.Samaj.findAll({
          attributes: ["name"],
        }),

        db.Member.findAll({
          attributes: [
            [Sequelize.fn("MIN", Sequelize.col("age")), "minAge"],
            [Sequelize.fn("MAX", Sequelize.col("age")), "maxAge"],
          ],
        }),
      ]);

      res.json({
        samajOptions: samajList.map((s) => s.name),
        bloodGroupOptions: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        genderOptions: ["Male", "Female", "Other"],
        ageRange: {
          min: ageRange[0].dataValues.minAge,
          max: ageRange[0].dataValues.maxAge,
        },
        maritalStatusOptions: ["Single", "Married", "Widowed", "Divorced"],
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      res.status(500).json({ error: "Failed to fetch filter options" });
    }
  },

  downloadMembers: async (req, res) => {
    try {
      const { samaj, gender, maritalStatus, ageMin, ageMax, bloodGroup } =
        req.query;

      const whereClause = {};

      if (samaj) {
        const samajRecord = await db.Samaj.findOne({ where: { name: samaj } });
        if (samajRecord) whereClause.samajId = samajRecord.id;
      }

      if (gender) whereClause.gender = gender;
      if (maritalStatus) whereClause.marital_status = maritalStatus;
      if (bloodGroup) whereClause.blood_group = bloodGroup;

      if (ageMin || ageMax) {
        whereClause.age = {};
        if (ageMin) whereClause.age[Op.gte] = parseInt(ageMin);
        if (ageMax) whereClause.age[Op.lte] = parseInt(ageMax);
      }

      const members = await db.Member.findAll({
        where: whereClause,
        include: [
          {
            model: db.Samaj,
            as: "samaj",
            attributes: ["name"],
          },
          {
            model: db.Family,
            as: "family",
            attributes: ["name", "lastName"],
          },
        ],
        order: [["name", "ASC"]],
        raw: true,
        nest: true,
      });
      console.log(members);
      // Transform data for CSV
      const csvData = members.map((member) => ({
        Name: member.name,
        Gender: member.gender,
        Age: member.age,
        "Blood Group": member.bloodGroup,
        "Mobile 1": member.mobile1,
        "Mobile 2": member.mobile2,
        "Marital Status": member.maritalStatus,
        Education: member.education,
        Occupation: member.occupation,
        "Annual Income": member.annualIncome,
        "Business Details": member.businessDetails,
        Gotra: member.gotra,
        "Dietary Preference": member.dietaryPreference,
        "Date of Birth": member.dateOfBirth,
        "Date of Marriage": member.dateOfMarriage,
        "Father Name": member.fatherName,
        "Mother Name": member.motherName,
        "Native Place": member.nativePlace,
        "Current Address": member.currentResidentialAddress,
        "Emergency Contact Name": member.emergencyContactName,
        "Emergency Contact Number": member.emergencyContactNumber,
        "Health Insurance Details": member.healthInsuranceDetails,
        "Chronic Health Conditions": member.chronicHealthConditions,
        "Special Skills": member.specialSkills,
        "Mother Tongue": member.motherTongue,
        "Aadhar Number": member.aadharNumber,
        "PAN Number": member.panNumber,
        Email: member.email,
        Samaj: member.samaj?.name,
        "Family Name":
          `${member.family?.name} ${member.family?.lastName}`.trim(),
      }));

      res.json({
        success: true,
        data: csvData,
        count: csvData.length,
      });
    } catch (error) {
      console.error("Error downloading members:", error);
      res.status(500).json({ error: "Failed to download members" });
    }
  },
};

module.exports = memberController;
