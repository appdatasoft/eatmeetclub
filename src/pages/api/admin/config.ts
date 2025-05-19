// pages/api/admin/config.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type AdminConfig = {
  siteTitle: string;
  maintenanceMode: boolean;
  maxUsers: number;
};

const config: AdminConfig = {
  siteTitle: 'EatMeetClub',
  maintenanceMode: false,
  maxUsers: 1000,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(config);
}
