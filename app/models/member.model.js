module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define("Member", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Core Required Fields (7)
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 120,
      },
    },
    bloodGroup: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
      },
    },
    mobile1: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[0-9]{10}$/i, // 10 digits
      },
    },
    mobile2: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9]{10}$/i,
      },
    },
    familyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Personal Information
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    aadharNumber: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        is: /^[0-9]{12}$/i, // 12 digits
      },
    },
    panNumber: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, // PAN format
      },
    },

    // Education & Career
    education: {
      type: DataTypes.STRING,
    },
    occupation: {
      type: DataTypes.STRING,
      defaultValue: "Not Working",
    },
    annualIncome: {
      type: DataTypes.STRING,
      defaultValue: "N/A",
    },
    businessDetails: {
      type: DataTypes.STRING,
    },

    // Religious & Cultural
    gotra: {
      type: DataTypes.STRING,
    },
    dietaryPreference: {
      type: DataTypes.ENUM("Vegetarian", "Jain", "Non-Vegetarian"),
    },

    // Family Relations & Marriage
    maritalStatus: {
      type: DataTypes.ENUM("Single", "Married", "Widowed", "Divorced"),
    },
    dateOfMarriage: {
      type: DataTypes.DATEONLY,
    },
    fatherName: {
      type: DataTypes.STRING,
    },
    motherName: {
      type: DataTypes.STRING,
    },

    // Location Details
    nativePlace: {
      type: DataTypes.STRING,
    },
    currentResidentialAddress: {
      type: DataTypes.STRING,
    },

    // Emergency & Health
    emergencyContactName: {
      type: DataTypes.STRING,
    },
    emergencyContactNumber: {
      type: DataTypes.STRING,
    },
    healthInsuranceDetails: {
      type: DataTypes.STRING,
    },
    chronicHealthConditions: {
      type: DataTypes.STRING,
    },

    specialSkills: {
      type: DataTypes.STRING,
      comment:
        "Skills that can benefit community (e.g., Doctor, Teacher, Legal)",
    },
    motherTongue: {
      type: DataTypes.STRING,
      defaultValue: "Hindi",
    },

    // Digital Presence
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
        len: [5, 255],
      },
    },

    samajId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "samaj_id",
    },
  });

  Member.associate = function (models) {
    Member.belongsTo(models.Samaj, {
      foreignKey: "samajId",
      as: "samaj",
    });

    Member.belongsTo(models.Family, {
      foreignKey: "familyId",
      as: "family",
    });
  };

  return Member;
};
