module.exports = (sequelize, DataTypes) => {
  const Samaj = sequelize.define("Samaj", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
  });

  Samaj.associate = (models) => {
    Samaj.hasMany(models.Family, {
      foreignKey: "samajId",
      as: "families",
    });
    Samaj.hasMany(models.Member, {
      foreignKey: "samajId",
      as: "members",
    });
  };

  return Samaj;
};
