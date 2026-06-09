import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true, default: 1 },
    phases: [
      {
        id: Number,
        label: String,
        sub: String,
        cls: String,
      },
    ],
    weeks: [
      {
        w: Number,
        phase: Number,
        title: String,
        note: String,
        days: [
          {
            lbl: String,
            topic: String,
            practice: Boolean,
            tasks: [String],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('StudyPlan', studyPlanSchema);
