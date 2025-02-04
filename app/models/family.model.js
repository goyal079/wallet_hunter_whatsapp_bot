module.exports = (sequelize, DataTypes) => {
  const Family = sequelize.define("Family", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
    },
    samajId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  Family.associate = (models) => {
    Family.belongsTo(models.Samaj, {
      foreignKey: "samajId",
      as: "samaj",
    });
    Family.hasMany(models.Member, {
      foreignKey: "familyId",
      as: "members",
    });
  };

  return Family;
};
