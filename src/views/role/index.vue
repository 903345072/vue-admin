<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.role_name" :placeholder="$t('roles.name')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        {{ $t('table.export') }}
      </el-button>
    </div>

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
      <el-table-column :label="$t('table.id')" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('roles.name')">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.role_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" width="400" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button size="mini" @click="handleModifyStatus(row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page-sizes="[10,20,50]" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('roles.name')" prop="name">
          <el-input v-model="temp.role_name" />
        </el-form-item>
        <el-form-item :label="$t('roles.permission_nodes')" prop="permission_nodes">
          <el-tree ref="tree2" :data="permissionList" :props="defaultProps" show-checkbox node-key="id" :default-expanded-keys="checkeds" :default-checked-keys="checkeds" @check-change="handleCheckChange" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createCard, updateRole, updateCardStatus } from '@/api/Roles'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Role',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap1 = {
        0: 'success',
        1: 'danger'
      }
      return statusMap1[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      checkeds: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      permission_node: null,
      permissionList: null,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+id',
        status: undefined,
        price: undefined,
        created_at: undefined
      },
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [0, 1],
      seatOpenOptions: [0, 1],
      seatTypeOptions: [0, 1, 2],
      showReviewer: false,
      temp: {
        id: undefined,
        status: 0
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
    this.getList()
  },
  methods: {
    handleCheckChange() {
      const res = this.$refs.tree2.getCheckedKeys().concat(this.$refs.tree2.getHalfCheckedKeys())
      this.permission_node = res
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.roles
        this.permissionList = response.data.permissions
        this.total = response.data.total
        // Just to simulate the time of the request
        this.listLoading = false
      })
    },
    opStatus(is_open) {
      const statusMap_3 = {
        0: '关闭',
        1: '开启'
      }
      return statusMap_3[is_open]
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row) {
      updateCardStatus({ id: row.id }).then(response => {
        this.getList()
        this.$message({
          message: '操作成功',
          type: 'success'
        })
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
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.tree2.setCheckedKeys([])
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.permission_node = this.permission_node
          createCard(this.temp).then((res) => {
            this.temp.id = res.data.id
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.getList()
            this.$nextTick(() => {
              this.$refs.tree2.setCheckedKeys([])
            })
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    checked(id, data, newArr) {
      data.forEach(item => {
        if (item.id === id) {
          if (item.children.length === 0) {
            newArr.push(item.id)
          }
        } else {
          if (item.children.length !== 0) {
            this.checked(id, item.children, newArr)
          }
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      var arr = this.temp.permission
      var newArr = []
      arr.forEach(item => {
        this.checked(item.id, this.permissionList, newArr)
      })
      this.checkeds = newArr
      console.log(newArr)
      console.log(arr)
      if (newArr.length === 0) {
        this.$nextTick(() => {
          this.$refs.tree2.setCheckedKeys([])
        })
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    cnStatus(status) {
      const statusMap_15 = {
        0: '开启',
        1: '关闭'
      }
      return statusMap_15[status]
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.permission_node = this.permission_node
          updateRole(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.getList()
            this.$nextTick(() => {
              this.$refs.tree2.setCheckedKeys([])
            })
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
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
        const tHeader = ['id', '座位编号', '每小时价格', '封顶价', '座位级别', '是否开启', '座位状态']
        const filterVal = ['id', 'name', 'price', 'price_max', 'seat_type', 'seat_open', 'status']
        const list_ = this.list
        for (var i = 0, l = list_.length; i < l; i++) {
          list_[i]['seat_type'] = this.cnType(list_[i]['seat_type'])
          list_[i]['seat_open'] = this.cnOpen(list_[i]['seat_open'])
          list_[i]['status'] = this.cnStatus(list_[i]['status'])
        }
        const data = this.formatJson(filterVal, list_)
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
