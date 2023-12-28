"use strict";

/* Magic Mirror
 * Module: MMM-Todoist
 *
 * By Chris Brooker
 *
 * MIT Licensed.
 */
//@ts-ignore
import { TodoistApi } from "@todoist-api-typescript"
//@ts-ignore
import NodeHelper from "node_helper";
//@ts-ignore
import showdown from "showdown";

const markdown = new showdown.Converter();
let config: any
module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function (notification: any, payload: JSON) {
        if (notification === "FETCH_TODOIST") {
            this.config = payload;
            this.fetchTodos();
        }
    },

    fetchTodos: function () {
        var self = this;
        //request.debug = true;
        const accessToken = self.config.accessToken;
        const api = new TodoistApi(accessToken)
        console.log("fetching Tasks...")
        api.getTasks({ roject_id: config.project }).then(
            (tasks: string) => {
                var taskJson = JSON.parse(tasks);
                taskJson.items.forEach((item: { contentHtml: any; content: any; }) => {
                    item.contentHtml = markdown.makeHtml(item.content);
                });

                self.sendSocketNotification("TASKS", taskJson);
            }

        )
            .catch((error: string) => {
                {
                    if (self.config.debug) {
                        console.log(error);
                    }
                    self.sendSocketNotification("FETCH_ERROR", {
                        error: error
                    });
                    return console.error(" ERROR - MMM-Todoist: " + error);
                }
            }

            )
        /*
                request({
                    url: self.config.apiBase + "/" + self.config.apiVersion + "/" + self.config.todoistEndpoint + "/",
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "cache-control": "no-cache",
                        "Authorization": "Bearer " + acessCode
                    },
                    form: {
                        sync_token: "*",
                        resource_types: self.config.todoistResourceType
                    }
                },
                    function (error, response, body) {
                        if (error) {
                            self.sendSocketNotification("FETCH_ERROR", {
                                error: error
                            });
                            return console.error(" ERROR - MMM-Todoist: " + error);
                        }
                        if (self.config.debug) {
                            console.log(body);
                        }
                        if (response.statusCode === 200) {
                            var taskJson = JSON.parse(body);
                            taskJson.items.forEach((item) => {
                                item.contentHtml = markdown.makeHtml(item.content);
                            });
    	
                            taskJson.accessToken = acessCode;
                            self.sendSocketNotification("TASKS", taskJson);
                        }
                        else {
                            console.log("Todoist api request status=" + response.statusCode);
                        }
    	
                    });
    	
                    */
    }
});