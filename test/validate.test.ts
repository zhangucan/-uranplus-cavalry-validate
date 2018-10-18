import { Validate } from '../src/index'
describe('test validate', () => {
    it('initDepartmentFruits() should return department fruits', async () => {
        const validate = new Validate()
        validate.init()
    }).timeout(50000)
})
