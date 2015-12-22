define(['jquery', 'zabbix', 'bootstraptable'], function( $, zabbix ) {
    return {
        triggerGet: function (params) {
            order = params.data.order.toUpperCase();
            paramszapi = {
                limit: 100,
                selectHosts: "extend",
                // withLastEventUnacknowledged: true,
                selectLastEvent: true,
                only_true: true,
                sortorder: order,
                active: true,
                sortfield: params.data.sort,
                search: {
                    description: params.data.search
                }
            };
            zabbix.tableLoad(params, "trigger.get", paramszapi);
        },
        triggerCount: function ( object, severity) {
            var params = {
                    output: "triggerids",
                    limit: 1000,
                    withLastEventUnacknowledged: true,
                    only_true: true,
                    active: true,
                    filter: {
                        priority: severity
                    },
                    countOutput: true
                },
                success = function (response, status) {
                    object.text(response.result);
                    var parent = object.parent();
                    parent.removeAttr('class');
                    if ( response.result === 0 ) {
                        parent.addClass("color-swatch brand-success");
                    } else {
                        parent.addClass("color-swatch brand-danger");
                    }
                };

            zabbix.zabbixAjax("trigger.get", params, success)
        },
        eventAcknowledge: function () {
            $(document).on('click', '#triggertable .eventAcknowledge', function() {
                // Make Modular open
                var modal = $( '#acknowledge-modal'),
                    triggerdata = $( this ).closest('tr'),
                    eventid = triggerdata.find( 'a.eventAcknowledge').attr('id'),
                    cell = {
                        index: triggerdata.attr('data-index'),
                        field: "lastEvent",
                        value: {
                            eventid: eventid
                        }
                    },
                    triggerhead = $( '#acknowledge-trigger-header'),
                    triggerdescription = triggerdata.find( 'td.description' ).text(),
                    triggerhostname = triggerdata.find( 'td.hostname').text();
                // Generate modal data
                modal.find('#acknowledge-event-trigger-description').text(triggerdescription);
                modal.find('#acknowledge-hostname').text(triggerhostname);
                modal.modal('show');

                $( '#acknowledge-event' ).on('click', function () {
                    $( this).prop('disabled', true);
                    var message = modal.find( '#acknowledge-comment').text(),
                        success = function (response, status) {
                            modal.modal('hide');
                            triggerhead.removeClass('panel-danger').addClass('panel-primary');
                            cell.value = $.extend({
                                acknowledged: 1
                            }, cell);
                            $('#triggertable').bootstrapTable('updateCell', cell);
                        },
                        error = function (response, status) {
                            triggerhead.removeClass('panel-primary').addClass('panel-danger');
                        };
                    params = {
                        eventids: eventid,
                        message: message
                    };
                    zabbix.zabbixAjax("event.acknowledge", params, success, error);
                });
            });
        }
    }
});