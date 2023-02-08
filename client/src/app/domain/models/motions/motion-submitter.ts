import { Id } from '../../definitions/key-types';
import { HasMeetingId } from '../../interfaces/has-meeting-id';
import { BaseModel } from '../base/base-model';

export class MotionSubmitter extends BaseModel<MotionSubmitter> {
    public static COLLECTION = `motion_submitter`;

    public weight!: number;

    public meeting_user_id!: Id; // meeting_user/submitted_motion_ids;
    public motion_id!: Id; // motion/submitter_ids;

    public constructor(input?: any) {
        super(MotionSubmitter.COLLECTION, input);
    }
}
export interface MotionSubmitter extends HasMeetingId {}
