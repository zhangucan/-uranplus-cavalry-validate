import * as _ from 'lodash'
import { search } from './common/es-service'
import * as path from 'path'
import * as raw_path from '@uranplus/cavalry-raw-files'
import * as moment from 'moment'
import { StaffPosition } from './model/staff-position.class'
import { Recruitment, JobSeeker } from './model/fruit.class'
import * as config from 'config'
const bodybuilder = require('bodybuilder')
const month = moment(config.get('cavalry.month')).format('YYYY-MM-DD')
var departments = require(path.join(raw_path, `standard/department-names/${month}/departments.json`))
var customer = require(path.join(raw_path, `standard/department-names/${month}/customers.json`))
export class Validate {
    departments: any
    monthDate: any
    customer: any
    staffPositions: StaffPosition[]
    achievements: Recruitment[]
    async init() {
        this.departments = departments
        this.customer = customer
        this.staffPositions = await search(
            'staff_position',
            'staff_position',
            bodybuilder()
                .filter('term', '_type', 'staff_position')
                .size(10000)
                .build()
        )

        this.achievements = await search(
            'achievement',
            'achievement',
            bodybuilder()
                .filter('term', 'month', month)
                .size(10000)
                .build()
        )
    }
    returnResult(output: any, log: string, isPassValidate: boolean) {
        return {
            output: output,
            log: log,
            isPassValidate: isPassValidate,
        }
    }
    validateTime = (time, a, b): boolean => {
        if (a && b) {
            return moment(time).isSameOrAfter(moment(new Date(a))) && moment(time).isSameOrBefore(moment(new Date(b)))
        } else if (a) {
            return moment(time).isSameOrAfter(moment(new Date(a)))
        } else if (b) {
            return moment(time).isSameOrBefore(moment(new Date(b)))
        } else {
            return true
        }
    }
    validateManagerIsExit = obj => {
        const { manager, time } = obj
        const employee = this.staffPositions.find(
            item => item.name === manager && this.validateTime(time, item.start, item.end)
        )
        if (!employee) {
            return this.returnResult(obj, `${moment(time).format('YYYY-MM-DD')}：人事报表无${manager}经理`, false)
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
    validateGroupleaderIsExit = obj => {
        const { groupLeader, time } = obj
        const employee = this.staffPositions.find(
            item => item.name === groupLeader && this.validateTime(time, item.start, item.end)
        )
        if (!employee) {
            return this.returnResult(obj, `${moment(time).format('YYYY-MM-DD')}：人事报表无${groupLeader}主管`, false)
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
    validateStaffIsExit = obj => {
        const { staff, time } = obj
        const employee = this.staffPositions.find(
            item => item.name === staff && this.validateTime(time, item.start, item.end)
        )
        if (!employee) {
            return this.returnResult(obj, `${moment(time).format('YYYY-MM-DD')}：人事报表无${staff}专员`, false)
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
    validateDepartmentInIsExit = obj => {
        const { departmentIn } = obj
        if (!this.departments.includes(departmentIn)) {
            return this.returnResult(obj, `本项目名称不正确，未在数据库中查到当前项目组：${departmentIn}`, false)
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
    validateCustomerIsExit = obj => {
        const { customer } = obj
        if (!this.customer.includes(customer)) {
            return this.returnResult(obj, `入职客户名称不正确，未在数据库中查到当前入职客户名称：${customer}`, false)
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
    validateInauguralUnitIsExit = obj => {
        const { inauguralUnit } = obj
        if (!this.departments.includes(inauguralUnit)) {
            return this.returnResult(obj, `就职项目名称不正确，未在数据库中查到当前项目组：${inauguralUnit}`, false)
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
    validateAchievementRecallIsExit = obj => {
        const { name, phone } = obj
        const jobSeeker = this.achievements
            .filter(item => item.jobSeeker)
            .find(item => item.jobSeeker.name === name && item.jobSeeker.phoneNumber === phone)
        if (!jobSeeker) {
            return this.returnResult(obj, `在上个月业绩表中没有查询到${name},请检查姓名电话是否正确`, false)
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
    validatePositionChange = obj => {
        const { leader, name, time } = obj
        const temp: StaffPosition = this.staffPositions.find(item => {
            const a = item.groupLeader ? item.groupLeader : item.manager
            return item.name === name && a === leader && this.validateTime(time, item.leaderStart, item.leaderEnd)
        })
        if (!temp && leader) {
            const temp2: StaffPosition = this.staffPositions.find(item => {
                return item.name === name && this.validateTime(time, item.leaderStart, item.leaderEnd)
            })
            const temp4: string[] = this.staffPositions.filter(item => item.name === leader).map(item => {
                return `${item.start} ~ ${item.end} | ${item.department}\r\n`
            })
            const temp3: string[] = this.staffPositions.filter(item => item.name === name).map(item => {
                return `${item.start} ~ ${item.end} | ${item.department} | ${item.nodeSlice.title}\r\n`
            })
            let b = null
            if (temp2) {
                b = temp2.groupLeader ? temp2.groupLeader : temp2.manager
            }
            return this.returnResult(
                obj,
                `${moment(time).format('YYYY-MM-DD')}:${name} 直接领导不是${leader},${
                    b ? '业绩表填写的上下级出错,应为' + b : '人事报表异动记录缺失'
                }\r\n${name}的任职情况为：\r\n${
                    temp3.length === 0 ? '空' : temp3
                } \n '人事报表直接领导任职情况为:'\r\n${temp4.length === 0 ? '空' : temp4}`,
                false
            )
        } else {
            return this.returnResult(obj, `通过校验`, true)
        }
    }
}
