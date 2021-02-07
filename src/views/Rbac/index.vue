<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      row-key="id"
      style="width: 100%;"
      lazy
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @sort-change="sortChange"
    >
      <el-table-column :label="$t('permissions.component')" align="right" class-name="status-col" width="200">
        <template slot-scope="{row}">
          {{ row.component }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('permissions.url')" class-name="status-col" width="200">
        <template slot-scope="{row}">
          {{ row.url }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('permissions.path')" class-name="status-col" width="200">
        <template slot-scope="{row}">
          {{ row.path }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('permissions.title')" class-name="status-col" width="200">
        <template slot-scope="{row}">
          {{ row.title }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" class-name="small-padding fixed-width">
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('permissions.component')" prop="name">
          <el-input v-model="temp.component" />
        </el-form-item>
        <el-form-item :label="$t('permissions.url')" prop="price">
          <el-input v-model="temp.url" />
        </el-form-item>
        <el-form-item :label="$t('permissions.title')" prop="price_max">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item :label="$t('permissions.path')" prop="price_max">
          <el-input v-model="temp.path" />
        </el-form-item>
        <el-form-item :label="$t('permissions.displayed_left')" prop="price_max">
          <template>
            <el-radio v-model="radio" label="1">是</el-radio>
            <el-radio v-model="radio" label="0">否</el-radio>
          </template>
        </el-form-item>
        <el-form-item :label="$t('permissions.parent_id')" prop="title">
          <el-cascader v-model="ddd" :options="list" :show-all-levels="false" :props="optionProps" @change="getParentId" />
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
import { fetchList, createPermission, updatePermission, deletePermission } from '@/api/permission'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

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
  name: 'Rbac',
  components: { },
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
      radio: '1',
      typeOptions: [],
      ddd: [],
      optionProps: {
        value: 'id',
        label: 'title',
        children: 'children',
        checkStrictly: true
      },
      form: {
        category: ['zhinan', 'shejiyuanze', 'yizhi']
      },
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        sort: '+sort',
        status: undefined,
        price: undefined,
        created_at: undefined
      },
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+sort' }, { label: 'ID Descending', key: '-sort' }],
      statusOptions: [0, 1],
      seatOpenOptions: [0, 1],
      seatTypeOptions: [0, 1, 2],
      showReviewer: false,
      temp: {
        id: undefined,
        component: undefined,
        path: undefined,
        title: undefined,
        parent_id: undefined,
        url: undefined
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
        title: [{}]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getParentId(res) {
      this.temp.parent_id = res[res.length - 1]
    },
    getList() {
      this.listLoading = true
      fetchList().then(response => {
        this.list = response.data
        const arrsa = []
        if (this.temp.id) {
          const checks_ = this.getAllParent(arrsa, this.list, this.temp.parent_id)
          this.ddd = checks_
          this.setDisable(this.list, this.temp.id)
        }
        this.listLoading = false
      })
    },
    getAllParent(arrs, datas_, cur_id) {
      datas_.forEach(v => {
        if (v.id === cur_id) {
          arrs.unshift(v.id)
          this.getAllParent(arrs, this.list, v.parent_id)
        }
        if (v.children.length > 0) {
          this.getAllParent(arrs, v.children, cur_id)
        }
      })
      return arrs
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
      deletePermission(row.id).then(response => {
        this.getList()
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      })
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'sort') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+sort'
      } else {
        this.listQuery.sort = '-sort'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined
      }
    },
    handleCreate() {
      this.ddd = []
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getList()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.temp.displayed_left = this.radio
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createPermission(this.temp).then((res) => {
            this.temp.id = res.data.id
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.getList()
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
    handleUpdate(row) {
      this.ddd = []
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.getList()
      this.radio = row.displayed_left
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    setDisable(datas, current_id) {
      datas.forEach(v => {
        if (v.id === current_id) {
          v.disabled = 'disabled'
          v.disabled = true
        }
        this.setDisable_(v.children)
      })
    },
    setDisable_(data_) {
      data_.forEach(v => {
        v.disabled = 'disabled'
        v.disabled = true
        console.log(222)
        if (v.children.length > 0) {
          this.setDisable_(v.children)
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.displayed_left = this.radio
          updatePermission(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.getList()
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
