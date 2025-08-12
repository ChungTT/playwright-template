// login to the application before running tests
globalSetup: require.resolve('./global/global-setup'),
use: { storageState: 'storage/auth.json' }
