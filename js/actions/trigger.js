define(['jquery', 'zabbix', 'actions/event', 'bootstraptable'], function( $, zabbix, event ) {
    return {
        triggerGet: function (params) {
            var order = params.data.order.toUpperCase(),
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
                    },
                    filter: {
                        value: 1
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
                        priority: severity,
                        value: 1
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
            var $tmodalAcknowledgeList = $( '#acknowledge-list' ),
                $modal = $( '#acknowledge-modal'),
                $tmodalDescription = $modal.find('#acknowledge-event-trigger-description'),
                $tmodalTextareaDiv = $modal.find( '#acknowledge-comment' ).parent( 'div' ),
                $tmodalHostname = $modal.find('#acknowledge-hostname'),
                $tmodalEventSum = $modal.find('#events-sum'),
                $tmodalAcknowledgeSum = $modal.find('#acknowledge-sum'),
                $tmodalExpandAcknowledge = $modal.find( '#expand-acknowledge' ),
                $triggerhead = $( '#acknowledge-trigger-header');
            $('#content').on('click', '#triggertable .eventAcknowledge', function() {
                // Make Modular open
                var $triggerdata = $( this ).closest('tr'),
                    eventid = $triggerdata.find( 'a.eventAcknowledge').attr('id'),
                    dataindex = $triggerdata.attr('data-index'),
                    triggerdescription = $triggerdata.find( 'td.description' ).text(),
                    triggerhostname = $triggerdata.find( 'td.hostname').text(),
                    triggerid = $triggerdata.find( 'td.triggerid').text();
                $tmodalAcknowledgeSum.attr('id', eventid);
                $modal.attr('id', dataindex);
                // Generate modal data
                $tmodalDescription.text(triggerdescription);
                $tmodalHostname.text(triggerhostname);
                event.sumEventsTrigger(triggerid, $tmodalEventSum, $tmodalAcknowledgeSum);
                $modal.modal('show');
            });

            $( '#acknowledge-event' ).on('click', function () {
                var $acknowledgebutton = $( this),
                    message = $modal.find( '#acknowledge-comment').val(),
                    success = function (response, status) {
                        $modal.modal('hide');
                        $triggerhead.removeClass('panel-danger').addClass('panel-primary'),
                        cell = {
                            index: $modal.attr('id'),
                            field: "lastEvent",
                            value: {
                                eventid: $tmodalAcknowledgeSum.attr('id'),
                                acknowledged: 1
                            }
                        };
                        // TODO: This is maybe a bug
                        // Try console.log(cell) to determine if this json is ok
                        $('#triggertable').bootstrapTable('updateCell', cell);
                        $acknowledgebutton.prop('disabled', false);
                    },
                    error = function (response, status) {
                        $triggerhead.removeClass('panel-primary').addClass('panel-danger');
                        $acknowledgebutton.prop('disabled', false);
                    },
                    params = {
                        eventids: $tmodalAcknowledgeSum.attr('id'),
                        message: message
                    };
                if ( message.length <= 4 ) {
                    $tmodalTextareaDiv.addClass( 'has-error' );
                } else {
                    $tmodalTextareaDiv.removeClass( 'has-error' );
                    zabbix.zabbixAjax("event.acknowledge", params, success, error);
                }
            });
            $modal.on('shown.bs.modal', function () {
                $('#acknowledge-comment').focus()
            });
            $tmodalExpandAcknowledge.on('click', function () {
                var $listItems = $tmodalAcknowledgeList.find( 'li' );
                if ( $listItems.length === 0 ) {
                    event.appendMessages($tmodalAcknowledgeSum.attr('id'), $tmodalAcknowledgeList);
                } else {
                    //$listItems.remove();
                    $tmodalAcknowledgeList.children( 'li' ).remove();
                }
            });
            $modal.on('hidden.bs.moda', function () {
                //console.log("test");
                //console.log($tmodalAcknowledgeList);
                $tmodalDescription.text("No trigger selected");
                $tmodalHostname.text("No trigger selected");
                $tmodalEventSum.text("None");
                $tmodalAcknowledgeSum.text("None");
                $tmodalAcknowledgeList.children( 'li' ).remove();
                $tmodalTextareaDiv.removeClass( 'has-error' );
                $tmodalAcknowledgeSum.attr('id', null);
                $modal.attr('id', null);
            });
        }
    }
});