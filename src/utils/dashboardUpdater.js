/**
 * Utility functions for triggering dashboard updates across components
 */

import { dataFetcher } from '../services/dataFetcher';

/**
 * Notify all components that a lead has been assigned
 * @param {Object} leadData - The lead data that was assigned
 */
export const notifyLeadAssigned = (leadData) => {
  // Clear relevant caches to ensure fresh data
  dataFetcher.invalidateCache('leads:employee');
  dataFetcher.invalidateCache('leads:status');

  // Use localStorage to communicate across tabs/components
  localStorage.setItem('lead_assigned', JSON.stringify({
    timestamp: Date.now(),
    leadId: leadData._id || leadData.id,
    leadName: leadData.name
  }));

  // Remove the item after a short delay to allow future events
  setTimeout(() => {
    localStorage.removeItem('lead_assigned');
  }, 1000);

  console.log('Lead assignment notification sent:', leadData.name);
};

/**
 * Notify all components that a lead has been updated
 * @param {Object} leadData - The lead data that was updated
 */
export const notifyLeadUpdated = (leadData) => {
  // Clear relevant caches to ensure fresh data
  dataFetcher.invalidateCache('leads:employee');
  dataFetcher.invalidateCache('leads:status');

  // Use localStorage to communicate across tabs/components
  localStorage.setItem('lead_updated', JSON.stringify({
    timestamp: Date.now(),
    leadId: leadData._id || leadData.id,
    leadName: leadData.name
  }));

  // Remove the item after a short delay to allow future events
  setTimeout(() => {
    localStorage.removeItem('lead_updated');
  }, 1000);

  console.log('Lead update notification sent:', leadData.name);
};

/**
 * Notify all components that a lead status has changed
 * @param {Object} leadData - The lead data with the new status
 */
export const notifyLeadStatusChanged = (leadData) => {
  // Clear relevant caches to ensure fresh data
  dataFetcher.invalidateCache('leads:status');

  // Use localStorage to communicate across tabs/components
  localStorage.setItem('lead_status_changed', JSON.stringify({
    timestamp: Date.now(),
    leadId: leadData._id || leadData.id,
    leadName: leadData.name,
    newStatus: leadData.status
  }));

  // Remove the item after a short delay to allow future events
  setTimeout(() => {
    localStorage.removeItem('lead_status_changed');
  }, 1000);

  console.log('Lead status change notification sent:', leadData.name, leadData.status);
};

/**
 * Notify all components that a follow-up has been added or updated
 * @param {Object} followUpData - The follow-up data
 */
export const notifyFollowUpChanged = (followUpData) => {
  // Clear relevant caches to ensure fresh data
  dataFetcher.invalidateCache('followUps');

  // Use localStorage to communicate across tabs/components
  localStorage.setItem('followup_changed', JSON.stringify({
    timestamp: Date.now(),
    followUpId: followUpData._id || followUpData.id,
    leadId: followUpData.leadId,
    employeeId: followUpData.employeeId || followUpData.assignedEmployee
  }));

  // Remove the item after a short delay to allow future events
  setTimeout(() => {
    localStorage.removeItem('followup_changed');
  }, 1000);

  console.log('Follow-up change notification sent');
};

/**
 * Notify all components that a task has been added or updated
 * @param {Object} taskData - The task data
 */
export const notifyTaskChanged = (taskData) => {
  // Clear relevant caches to ensure fresh data
  dataFetcher.invalidateCache('tasks');

  // Use localStorage to communicate across tabs/components
  localStorage.setItem('task_changed', JSON.stringify({
    timestamp: Date.now(),
    taskId: taskData._id || taskData.id,
    employeeId: taskData.employeeId,
    description: taskData.description || taskData.task
  }));

  // Remove the item after a short delay to allow future events
  setTimeout(() => {
    localStorage.removeItem('task_changed');
  }, 1000);

  console.log('Task change notification sent');
};

export default {
  notifyLeadAssigned,
  notifyLeadUpdated,
  notifyLeadStatusChanged,
  notifyFollowUpChanged,
  notifyTaskChanged
};
