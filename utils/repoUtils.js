import _ from 'lodash';
import schedule from 'node-schedule';

export function scheduleRepoCreate(appointmentSnapshot) {
    const appointment = appointmentSnapshot.val();

    if (!appointment.start) {
        return;
    }

    const appointmentDate = Date.parse(appointment.start);
    const appointmentCandidate = appointment.candidate;
    const appointmentAssessment = appointment.assessment;
    const jobKey = appointmentSnapshot.key;
    let currentJob = schedule.scheduledJobs[jobKey];
    if (currentJob) {
        currentJob.reschedule(appointmentDate);
    } else {
        const job = (ref, appointment) => {
            const { candidate, assessment, duration } = appointment;
            const repoInstanceUrl = this.generateRepo(candidate, assessment);

            ref.off();
            ref.child('repoInstanceUrl').set(repoInstanceUrl);
            this.scheduleRepoClose(repoInstanceUrl, duration);
        };
        currentJob = schedule.scheduleJob(jobKey, appointmentDate, 
            job.bind(this, appointmentSnapshot.ref, appointment));
    }
}

export function scheduleRepoClose(repoInstanceUrl, duration) {
    setTimeout(() => this.closeRepo(repoInstanceUrl), duration * 60 * 1000);
}

export function durationToMilliseconds(duration) {
    return duration * 60 * 1000;
}