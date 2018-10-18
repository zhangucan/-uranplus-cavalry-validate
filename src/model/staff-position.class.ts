import { NodeSlice } from './node-slice.class'
import { JobStatus } from './job-status.enum'
export class StaffPosition {
    branch?: string // 部门
    department?: string // 组别
    manager?: string // 经理
    groupLeader?: string // 主管
    leader?: string // 直接领导
    title?: string // 职级
    position?: string // 职位
    name?: string //姓名
    start?: string //开始日期
    end?: string //结束日期
    leaderStart?: string //上级开始日期
    leaderEnd?: string //上级结束日期
    status?: JobStatus
    nodeSlice?: NodeSlice // nodeSlice from tree-life
}
