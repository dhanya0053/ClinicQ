export interface DoctorSchedule{
    doctorId: string;
    days: string[];
    startTime:string;
    endTime:string;
    slotDuration:number;
}

export interface ClinicRules{
    maxPatientsPerSlot:number;
    maxDaysInAdvance:number;
    cancellationCutoffHours:number;
}
export interface ClinicStats{
    totalAppointments:number;
    totalWalkIns:number;
    completedVisits:number;
    noShows:number;
}