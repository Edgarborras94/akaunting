
export default {
    data: function () {
        return {
            currentTab: undefined,
            newDatas: false,
            model: {
                name: "",
                rate: "",
                select: "",
                enabled: 1
            },
            error_field: {}
        }
    },

    methods: {
        addItem() {
            this.newDatas = true;
            this.currentTab = undefined;
            this.error_field = {};

            if (this.model) {
                this.model.name = '';
                this.model.rate = '';
                this.model.select = '';
            }
        },

        handeClickEdit(item, index) {
            this.newDatas = false;
            this.currentTab = index;
            this.error_field = {};

            if (this.model) {
                this.model.name = item.name ? item.name : '';
                this.model.rate = item.rate ? item.rate : '';
                this.model.select = item.code ? item.code : '';
            }
        },

        handleClickCancel() {
            this.currentTab = undefined;
        },

        dataHandleEvent() {
            this.newDatas = false;
            this.currentTab = undefined;
            this.model.name = '';
            this.model.rate = '';
            this.model.select = '';
            this.model.enabled = 1;
        },

        onSuccessEvent(response) {
            let type = response.data.success ? 'success' : 'error';
            let timeout = 1000;

            if (response.data.important) {
                timeout = 0;
            }

            this.$notify({
                message: response.data.message,
                timeout: timeout,
                icon: "fas fa-bell",
                type,
            });

            this.dataHandleEvent();
        },

        onSuccessDelete(event) {
            let type = event.success ? 'success' : 'error';
            let timeout = 1000;

            if (event.important) {
                timeout = 0;
            }

            this.$notify({
                message: event.message,
                timeout: timeout,
                icon: "fas fa-bell",
                type,
            });

            this.dataHandleEvent();
        },

        onEditEvent(form_method, form_url, plus_data, form_list, form_id) {
            const formData = new FormData(this.$refs["form"]);
            const data = {};
            let file = {};

            for (let [key, val] of formData.entries()) {
                Object.assign(data, {
                    [key]: val,
                });
            }

            if(plus_data == 'type') {
                Object.assign(data, {
                    ['type']: 'normal',
                });
            }
            
            window.axios({
                    method: form_method,
                    url: form_url,
                    data: data,
                })
                .then(response => {
                    if (form_list.length) {
                        form_list.forEach(item => {
                            if (item.id == form_id) {
                                item.name = response.data.data.name;
                                item.code = response.data.data.code;
                                item.rate = response.data.data.rate;
                                item.type = plus_data == undefined ? 'normal' : ''
                            }
                        });
                    }

                    this.onSuccessEvent(response);

                }, this)
                .catch(error => {
                    this.onFailError(error)
                }, this);
        },

        onSubmitEvent(form_method, form_url, plus_data, form_list) {
            const formData = new FormData(this.$refs["form"]);
            const data = {};

            for (let [key, val] of formData.entries()) {
                Object.assign(data, {
                    [key]: val,
                });
            }

            if(plus_data == 'type') {
                Object.assign(data, {
                    ['type']: 'normal',
                });
            }

            window.axios({
                    method: form_method,
                    url: form_url,
                    data: data,
                })
                .then(response => {
                    form_list.push({
                        "id": response.data.data.id,
                        "name": response.data.data.name,
                        "code": response.data.data.code,
                        "rate": response.data.data.rate,
                        "enabled": response.data.data.enabled != undefined ? response.data.data.enabled : 'true'
                    });

                    this.onSuccessEvent(response);

                }, this)
                .catch(error => {
                    this.onFailError(error);
                }, this);
        },

        onEditCompany() {
            FormData.prototype.appendRecursive = function(data, wrapper = null) {  
                for(var name in data) {
                    if (name == "previewElement" || name == "previewTemplate") {
                    continue;
                }
                if (wrapper) {
                    if ((typeof data[name] == 'object' || Array.isArray(data[name])) && ((data[name] instanceof File != true ) && (data[name] instanceof Blob != true))) {
                        this.appendRecursive(data[name], wrapper + '[' + name + ']');
                    } else {
                        this.append(wrapper + '[' + name + ']', data[name]);
                    }
                } else {
                    if ((typeof data[name] == 'object' || Array.isArray(data[name])) && ((data[name] instanceof File != true ) && (data[name] instanceof Blob != true))) {
                        this.appendRecursive(data[name], name);
                    } else {
                        this.append(name, data[name]);
                    }
                }
                }
            }

            const formData = new FormData(this.$refs["form"]);
            
            let data_name = {};
            for (let [key, val] of formData.entries()) {
                Object.assign(data_name, {
                    [key]: val,
                    ['logo']: this.$refs.dropzoneWizard.files[1] ? this.$refs.dropzoneWizard.files[1] : this.$refs.dropzoneWizard.files[0],
                    ['_prefix']: 'company',
                    ['_token']: window.Laravel.csrfToken,
                    ['_method']: 'POST',
                });
            }
            formData.appendRecursive(data_name);
           
            window.axios({
                    method: 'POST',
                    url: url + "/wizard/companies",
                    data: formData,
                    headers: {
                        'X-CSRF-TOKEN': window.Laravel.csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => {
                    this.onSuccessEvent(response);

                }, this)
                .catch(error => {
                    this.onFailError(error)
                }, this);
        },

        onDeleteEvent(event, form_list, event_id) {
            form_list.forEach(function (item, index) {
                if (item.id == event_id) {
                  form_list.splice(index, 1);
                  return;
                }
              }, this);

              this.component = "";

              this.onSuccessDelete(event);
        },

        onFailErrorGet(field_name) {
            if(this.error_field[field_name]) {
                return this.error_field[field_name][0];
            }
        },

        onFailError(error) {
            this.error_field = error.response.data.errors;
        }
    }
}
