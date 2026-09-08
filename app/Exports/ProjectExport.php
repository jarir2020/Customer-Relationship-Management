<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\Project;

class ProjectExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $projects;

    public function __construct($projects)
    {
        $this->projects = $projects;
    }

    public function collection()
    {
        return $this->projects;
    }

    public function headings(): array
    {
        return [
            __('app.id'),
            __('app.projectName'),
            __('app.client'),
            __('app.projectAdmin'),
            __('app.status'),
            __('app.budget'),
            __('app.startDate'),
            __('app.deadline'),
            __('app.completionPercent'),
        ];
    }

    public function map($project): array
    {
        return [
            $project->id,
            $project->project_name,
            $project->client->name ?? '--',
            $project->projectAdmin->name ?? '--',
            $project->status,
            $project->project_budget ?? 0,
            $project->start_date,
            $project->due_date,
            $project->completion_percent ?? 0,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
