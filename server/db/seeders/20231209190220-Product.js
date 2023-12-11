/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Products',
      [
        {
          title: 'Коробка',
          price: 12.97,
          data: '10.07.1999 11:00:00',
        },
        {
          title: 'Мороженое',
          price: 1.12,
          data: '10.07.2022 07:00:00',
        },
        {
          title: 'Самокат',
          price: 500.53,
          data: '10.07.2022 06:00:00',
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  },
};
