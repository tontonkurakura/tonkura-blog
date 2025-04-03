The HCP-MMP1 atlas is based on the asymmetrical version of the MNI projection of the HCP-MMP1 (MMP_in_MNI_corr.nii.gz) available on figshare and neurovault.

In each hemisphere, Glasser divides 180 “areas” into 22 separate “regions”. Here I refer to the 180 areas as regions to be consistent with other atlases where “region” generally refers to the smallest partition of interest. I call the 22 larger partitions cortices.

In this HCP-MMP1 atlas the 180 regions are numbered 1-180. On the right the regions are numbered 201-380 so that 201 is the right homologue of 1; 262 is the right homologue of 62, etc.) Note that MRtrix3 renumbers the values on the right to go from 181 to 360 to avoid the discontinuity (i.e., unused values between 181 and 199). The original atlas uses 1-180 on the right and 201-380 on the left. MRtrix and some other verisons of the atlas (like this one) swap the left and right labels (hence 1-180 on the left, 201-380 on the right).

Each of the 180 regions occupies one of 22 cortices which are displayed in a separate atlas: HCP-MMP1_cortices. These are numbered 1-22 on the left and 101-122 on the right, in keeping with the original strategy.

Detailed information about the regions and cortices are available in the Glasser 2016 Supplemental file: “Supplementary Neuroanatomical Results For A Multi-modal Parcellation of Human Cerebral Cortex”. I have made the the following helpful files available:

The final table of 180 regions from that supplemental file available as an Excel sheet: Glasser_2016_Table.xlsx

HCP-MMP1_UniqueRegionList.csv providing information from the final table in addition to a center of gravity in voxel coordinates and a volume in cubic mm for each of the 360 regions (180 in each hemisphere).

A text file naming the 22 cortices and how they are grouped as per descriptions in the supplemental material.

HCP-MMP1_cortex_UniqueRegionList.csv providing the center of gravity in voxel coordinates and the volume in cubic mm for each of the 44 cortices (22 in each hemisphere).