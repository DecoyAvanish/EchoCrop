export type Category={id:string;name:string;color:string;shape:string;monthlyBudget:number};
export type Transaction={id:string;date:string;merchant:string;amount:number;categoryId:string;recurringId:string|null;income?:boolean};
export type Bill={id:string;name:string;amount:number;cycle:'weekly'|'monthly'|'yearly';nextDate:string;categoryId:string};
export type Goal={id:string;name:string;target:number;saved:number;starIds:string[]};
export type AppPage='landing'|'signup'|'login'|'forgot'|'verify'|'onboarding'|'sky'|'goals'|'insights'|'settings'|'help'|'privacy'|'terms'|'accessibility'|'notfound';
export type MotionLevel='full'|'reduced'|'none';
export type Theme='midnight'|'daybreak'|'contrast-dark'|'contrast-light';
