<template>
  <div class="app-container">
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('interest.heyue_name')" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.hname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('interest.leverage_name')" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.lname }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('interest.rate')" min-width="250" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.rate" style="width: 200px;" class="filter-item" onkeyup="value=value.replace(/[^\d^\.]/g,'')" @input="handleFilter(scope.row.rate,scope.row.hid,scope.row.lid)" @keyup.enter.native="handleFilter(scope.row.rate,scope.row.hid,scope.row.lid)" />
        </template>
      </el-table-column>
    </el-table>
    <div style="width: 100%;display: flex;justify-content: center;margin-top: 30px;">
      <el-button v-permission="['/interest/setInterest']" v-waves :loading="downloadLoading" class="filter-item" type="primary" @click="saveInterest">
        {{ $t('table.save') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { fetchList, createLeverage, updateLeverage, updateLeverageStatus, setInterest } from '@/api/interest'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'danger'
      }
      return statusMap[status]
    },
    cnStatus(status) {
      const statusMap_ = {
        0: '有效',
        1: '无效'
      }
      return statusMap_[status]
    },
    opStatus(status) {
      const statusMap_ = {
        0: '禁用',
        1: '恢复'
      }
      return statusMap_[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      checkedroles: [],
      isIndeterminate: true,
      checkAll: false,
      roles: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        name: undefined,
        sort: '+id',
        is_deleted: undefined
      },
      importanceOptions: [0, 1],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [0, 1],
      showReviewer: false,
      temp: {
        id: undefined,
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    console.log(this.$store.state.user.routelist)
    this.getList()
  },
  methods: {
    saveInterest() {
      var data = this.list
      setInterest({ data: data }).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        this.getList()
      })
    },
    getcheckedroles(roles_) {
      var arr_ = []
      roles_.forEach(function(k, v) {
        arr_.push(k['id'])
      })
      return arr_
    },
    handleCheckAllChange(val) {
      var arr = []
      if (val) {
        this.roles.forEach(function(k, v) {
          arr.push(k['id'])
        })
      }
      this.checkedroles = val ? arr : []
      this.isIndeterminate = false
    },
    handleCheckedrolesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.roles.length
      this.checkedroles = value
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.roles.length
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.listLoading = false
      })
    },
    handleFilter(rate, hid, lid) {
      console.log(this.list)
    },
    handleModifyStatus(row) {
      updateLeverageStatus({ id: row.id, is_deleted: row.is_deleted === 0 ? 1 : 0 }).then(response => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.is_deleted = row.is_deleted === 0 ? 1 : 0
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
    },
    resetTemp() {
      this.temp = {
        status: 1,
        id: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.checkedroles = []
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createLeverage(this.temp).then((res) => {
            this.temp.id = res.data.id
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '创建成功.',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateLeverage(tempData).then(() => {
            delete this.temp.passwd
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '更新成功.',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['id', '创建时间', '用户名', '状态']
        const filterVal = ['id', 'created_at', 'username', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
