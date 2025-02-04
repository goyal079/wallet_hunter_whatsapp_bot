module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define("Conversation", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currentState: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tempData: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    lastInteraction: {
      type: DataTypes.DATE,
    },
    isComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Conversation;
};
