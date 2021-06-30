const fs = jest.createMockFromModule('fs');

fs.existsSync = jest.fn().mockReturnValue(true);

module.exports = fs;